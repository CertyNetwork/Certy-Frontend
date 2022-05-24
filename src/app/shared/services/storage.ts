import { Injectable } from '@angular/core';
import { FirebaseApp, initializeApp, getApp } from 'firebase/app';
import { FirebaseStorage, ref, uploadBytes, getStorage } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import Arweave from 'arweave';
import { formatResponse, ResponseData } from '../utils/responseBuilder';
import { retryFetch } from '../utils/retryFetch';
import arweaveKey from '../../../environments/arware.json';
import { environment } from 'src/environments/environment';

const CLOUD_URI = '';
const FIREBASE_MJS_ID = 'FIREBASE_MJS_ID';
const ARWEAVE_FOLDER = 'arweave';
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
  public firebase: FirebaseApp | undefined;
  public storage: FirebaseStorage | undefined;
  public apiKey: string = '';
  arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https'
  });

  constructor() {
    let certifyFirebase;
    try {
      certifyFirebase = getApp('certify-web');
    } catch(e) {
      console.log(e);
    }

    this.firebase = certifyFirebase ?? initializeApp(environment.firebaseConfig, 'certify-web');

    this.storage = getStorage(this.firebase);
  }

  /**
   * Uploads metadata to Arweave via a cloud function
   * @param metadata metadata object
   * @returns arweave content identifier
   */
   public async uploadMetadata(
    metadata: unknown
  ): Promise<ResponseData<{ id: string }>> {
    try {
      const request = await retryFetch(`${CLOUD_URI}/arweave/metadata/`, {
        method: 'POST',
        body: JSON.stringify(metadata),
        headers: {
          [headers.apiKey]: this.apiKey || 'anonymous',
          'Access-Control-Allow-Origin': '*',
          'Content-type': 'text/plain',
        },
      });

      const data: { id: string } = await request.json();

      return formatResponse({ data });
    } catch (error) {
      return formatResponse({ error: ERROR_MESSAGES.uploadMetadata });
    }
  }

  /**
   * Upload file to Arweave via a cloud function
   * @param file the file to upload
   * @returns returns an object containing the arweave content identifier and the content type.
   */
  public async uploadToArweave(file: File): Promise<ResponseData<{ id: string; contentType: string }>> {
    const buffer = await file.arrayBuffer();
    const contentType = file.type;

    try {
      try {
        const jwk = {
          d: arweaveKey.d,
          p: arweaveKey.p,
          q: arweaveKey.q,
          dp: arweaveKey.dp,
          dq: arweaveKey.dq,
          qi: arweaveKey.qi,
          kty: arweaveKey.kty,
          e: arweaveKey.e,
          n: arweaveKey.n,
        };
        const transaction = await this.arweave.createTransaction({
          data: buffer
        }, jwk);
        transaction.addTag('Content-Type', contentType);

        await this.arweave.transactions.sign(transaction, jwk);
        
        const result = await this.arweave.transactions.post(transaction);
        
        console.log(result);

        return formatResponse({ data: { id: transaction.id, contentType } });
      } catch (error) {
        return formatResponse({
          error: ERROR_MESSAGES.decentralizedStorageFailed,
        });
      }
    } catch (error: any) {
      return formatResponse({ error: error.message });
    }
  }

  /**
   * Uploads raw binary data to the cloud. We can trigger an arweave upload via an http request with the returned file name.
   * @param buffer the raw binary data of the file to upload
   * @param contentType the content type
   * @returns the filename
   */
  private async uploadCloud(
    buffer: ArrayBuffer | Buffer,
    contentType: string
  ): Promise<ResponseData<string>> {
    try {
      const fileName = uuidv4();

      if (!this.storage)
        return formatResponse({ error: 'Storage is not initialized' });

      const storageRef = ref(this.storage, `${ARWEAVE_FOLDER}/${fileName}`);
      await uploadBytes(storageRef, buffer, { contentType: contentType });

      return formatResponse({ data: fileName });
    } catch (error) {
      return formatResponse({ error: ERROR_MESSAGES.uploadCloud });
    }
  }
}