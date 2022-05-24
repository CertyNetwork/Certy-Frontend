import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Contract } from "near-api-js";
import * as uuid from 'uuid';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';
import { CertificateData } from '../models/certificate-data';
import { formatResponse, ResponseData } from '../utils/responseBuilder';
import { Storage } from './storage';
import { correctFileType } from '../utils/files';

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
    // this.web3Modal = new Web3Modal({
    //   cacheProvider: true, // optional
    //   providerOptions: {
    //     walletconnect: {
    //       package: WalletConnectProvider, // required
    //       options: {
    //         infuraId: "INFURA_ID" // required
    //       }
    //     }
    //   },
    // });

    // // Subscribe to provider connection
    // this.web3Modal.on("connect", (info: { chainId: number }) => {
    //   console.log(info);
    // });

    // // Subscribe to provider disconnection
    // this.web3Modal.on("disconnect", (error: { code: number; message: string }) => {
    //   console.log(error);
    // });
    this.loadContract();
  }

  // async connectAccount() {
  //   this.web3Modal.clearCachedProvider();
  //   this.provider = (await this.web3Modal.connect()) as provider; // set provider
  //   console.log(this.provider);
    
  //   // Subscribe to accounts change
  //   this.provider.on("accountsChanged", (accounts: string[]) => {
  //     console.log(accounts);
  //   });

  //   // Subscribe to chainId change
  //   this.provider.on("chainChanged", (chainId: number) => {
  //     console.log(chainId);
  //   });
  //   this.web3js = new Web3(this.provider); // create web3 instance
  //   const accounts = await this.web3js.eth.getAccounts(); 
  //   this.accountStatusSource.next(accounts);
  // }

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
        viewMethods: ["nft_tokens", "nft_token", "nft_tokens_for_owner", "nft_supply_for_owner"], // view methods
        changeMethods: ["nft_mint", "nft_transfer"], // change methods
      }
    );
  }

  async getCertInfo(){
    if (!this.contract) {
      return null;
    }
    // @ts-ignore: method does not exist on Contract type
    let count = await this.contract.get_num({args:{}}).catch((err: any) => console.log(err))
    return count;
  }

  async getAllCerts(){
    if (!this.contract) {
      return null;
    }
    const accountId = this.authService.wallet?.getAccountId();
    // @ts-ignore: method does not exist on Contract type
    let count = await this.contract.nft_tokens_for_owner({
      account_id: accountId
    }).catch((err: any) => console.log(err))
    return count;
  }
  
  async mintCertificate(data: CertificateData) {
    if (!this.contract) {
      return false;
    }
    const tokenId = uuid.v4();
    const accountId = this.authService.wallet?.getAccountId();
    // @ts-ignore: method does not exist on Contract type
    await this.contract.nft_mint({
      token_id: tokenId,
      receiver_id: accountId,
      meta: data
    });
    return true;
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
