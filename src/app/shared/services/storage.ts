import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Web3Storage } from 'web3.storage';
import { environment } from 'src/environments/environment';
import { lastValueFrom } from 'rxjs';

const headers = {
  apiKey: 'api-key',
};
export const ERROR_MESSAGES = {
  fileSizeExceeded: 'File size exceeded',
  fileTypeNotAccepted: 'File type not accepted',
  fileNoExtension: 'File does not have extension',
  metadataSet: 'Failed at setting metadata',
  metadataEmpty: 'Metadata is empty',
  notString: 'Value is not of type string',
  badUrl: 'URL is not well formatted',
  uploadFileAndSet: 'Failed at uploading and setting metadata field',
  uploadFile: 'Failed at uploading file',
  uploadCloud: 'Failed at uploading file to the cloud',
  uploadMetadata: 'Failed at uploading metadata',
  decentralizedStorageFailed: 'Failed storing on Arweave',
  invalidKeyPair: 'No valid key pair',
  undefinedAccountId: 'Account Id is undefined',
  undefinedKeyStore: 'Key Store is undefined',
  walletNotConnected: 'Wallet is not connected',
  invalidRoyalties: 'Royalty percentage is invalid',
}

@Injectable({
  providedIn: 'root'
})
export class Storage {
  public apiKey: string = '';
  web3Storage = new Web3Storage({ token: environment.WEB3STORAGE_TOKEN });

  constructor(
    private http: HttpClient
  ) {
   
  }

  /**
   * Upload file to Web3Storage
   * @param file the file to upload
   * @returns returns an object containing the arweave content identifier and the content type.
   */
   public async uploadToWeb3Storage(files: File[]): Promise<string> {
    try {
      const cid = await this.web3Storage.put(files);
      return cid;
    } catch (error: any) {
      throw new Error('Error while upload media to IPFS.')
    }
  }

  /**
   * Upload file to server
   * @param files the files to upload
   * @returns returns an rootCid string
   */
   public async upload(files: File[], metaData?: {[key: string]: string}): Promise<string> {
    try {
      var formData = new FormData();
      // Append files to the virtual form.
      for (const file of files) {
        formData.append('files', file);
      }

      if (metaData) {
        for (var key in metaData) {
          if (metaData.hasOwnProperty(key)) {
            formData.append(key, metaData[key]);
          }
        }
      }
      
      const { data: {rootCid} } = await lastValueFrom(this.http.post<any>(`${environment.apiUrl}/web3-storage/put-files`, formData));
      return rootCid;
    } catch (error: any) {
      throw new Error('Error while upload media.')
    }
  }
}