import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Contract, utils } from "near-api-js";
import * as uuid from 'uuid';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';
import { CertificateData } from '../models/certificate-data';
import { formatResponse, ResponseData } from '../utils/responseBuilder';
import { Storage } from './storage';
import { correctFileType } from '../utils/files';
import { Category } from '../models/category';

@Injectable({
  providedIn: 'root'
})
export class ContractService {
  private accountStatusSource = new BehaviorSubject<string[]>([]);
  accountStatus$ = this.accountStatusSource.asObservable();
  FILE_UPLOAD_SIZE_LIMIT = 1000;
  contract?: Contract;

  constructor(
    private authService: AuthService,
    private storage: Storage,
  ) {
    this.loadContract();
  }

  private loadContract() {
    if (!this.authService.wallet || !this.authService.wallet.isSignedIn) {
      return;
    }
    const account = this.authService.wallet.account();
    this.contract = new Contract(
      account, // the account object that is connecting
      environment.contractName,
      {
        // name of contract you're connecting to
        viewMethods: [
          "nft_tokens",
          "nft_token",
          "nft_tokens_for_owner",
          "nft_supply_for_owner",
          'categories_for_owner',
          'category_info',

          'cert_get_by_category',

        ], // view methods
        changeMethods: [
          "nft_mint",
          "nft_transfer",
          'category_create',
          'category_update',

          'cert_mint',
          'cert_bulk_mint',
          'cert_update'
        ], // change methods
      }
    );
  }

  async getCategories(): Promise<any> {
    if (!this.contract) {
      return [];
    }
    const accountId = this.authService.wallet?.getAccountId();
    // @ts-ignore: method does not exist on Contract type
    const categories = await this.contract.categories_for_owner({
      account_id: accountId
    }).catch((err: any) => console.log(err))
    return categories.map((cat: any) => ({
      id: cat.category_id,
      ...cat.metadata,
      fields: JSON.parse(cat.metadata.fields)
    }));
  }

  async createCategory(category: Category) {
    if (!this.contract) {
      return null;
    }
    const metadata = {
      title: category.title,
      description: category.description,
      media: category.media,
      fields: JSON.stringify(category.fields),
      issued_at: Date.now(),
    };
    try {
      // @ts-ignore: method does not exist on Contract type
      let addedCategory = await this.contract.category_create({
        metadata: metadata,
      }, '300000000000000', utils.format.parseNearAmount("1"));
      return addedCategory;
    } catch (e) {
      console.log(e);
    }
  }

  async updateCategory(category: Category) {
    if (!this.contract) {
      return null;
    }
    const metadata = {
      title: category.title,
      description: category.description,
      media: category.media,
      updated_at: Date.now(),
    };
    try {
      // @ts-ignore: method does not exist on Contract type
      let updatedCategory = await this.contract.category_update({
        category_id: category.id,
        metadata: metadata,
      }, '300000000000000', utils.format.parseNearAmount("1"));
      return updatedCategory;
    } catch (e) {
      console.log(e);
    }
  }

 async getCategory(categoryId: string): Promise<Category | null> {
  if (!this.contract) {
    return null;
  }
  // @ts-ignore: method does not exist on Contract type
  let category = await this.contract.category_info({category_id: categoryId}).catch((err: any) => console.log(err));
  return {
    id: category.category_id,
    ...category.metadata,
    fields: JSON.parse(category.metadata.fields)
  };
 }
  
  async mintCertificate(data: CertificateData, categoryId?: string) {
    if (!this.contract) {
      return false;
    }
    const accountId = this.authService.wallet?.getAccountId();
    // @ts-ignore: method does not exist on Contract type
    await this.contract.cert_mint({
      receiver_id: accountId,
      category_id: categoryId,
      metadata: data
    }, '300000000000000', utils.format.parseNearAmount("1"));
    return true;
  }

  async bulkMintCertificate(data: CertificateData, categoryId?: string) {
    if (!this.contract) {
      return false;
    }
    const tokenId = uuid.v4();
    const accountId = this.authService.wallet?.getAccountId();
    // @ts-ignore: method does not exist on Contract type
    await this.contract.nft_mint({
      receiver_ids: accountId,
      category_id: categoryId,
      metadatas: data
    }, '300000000000000', utils.format.parseNearAmount("1"));
    return true;
  }

  async getOwnCerts(): Promise<any> {
    if (!this.contract) {
      return [];
    }
    const accountId = this.authService.wallet?.getAccountId();
    // @ts-ignore: method does not exist on Contract type
    const tokens = await this.contract.nft_tokens_for_owner({
      account_id: accountId
    }).catch((err: any) => console.log(err))
    return tokens.map((tk: any) => ({
      ...tk
    }));
  }

  /**
   * Uploads file and returns corresponding URI.
   * @param file The file to upload.
   */
   public async upload(
    file: File
  ): Promise<ResponseData<{ uri: string; hash: string }>> {
    try {
      if (!this.storage) {
        return formatResponse({ error: 'Storage not initialized' });
      }

      // corrects MIME type.
      const tFile = await correctFileType(file);

      if (tFile.size > this.FILE_UPLOAD_SIZE_LIMIT) {
        formatResponse({ error: 'File size is too big' })
      }

      const { data: result, error } = await this.storage.uploadToArweave(file);

      if (!result || error) return formatResponse({ error });

      const data = {
        uri: `${environment.BASE_ARWEAVE_URI}/${
          result?.id
        }`,
        hash: result?.id,
      }

      return formatResponse({ data })
    } catch (error: any) {
      return formatResponse({ error: error.message })
    }
  }
}
