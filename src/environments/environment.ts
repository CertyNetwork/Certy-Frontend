// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  basePath: '/api',
  networkId: 'testnet',
  contractName: 'certy.edricngo.testnet',
  nodeUrl: 'https://rpc.testnet.near.org',
  walletUrl: 'https://wallet.testnet.near.org',
  helperUrl: 'https://helper.testnet.near.org',
  explorerUrl: 'https://explorer.testnet.near.org',
  BASE_ARWEAVE_URI: 'https://arweave.net',
  firebaseConfig: {
    apiKey: "AIzaSyAH6-KUWqDuPfIFXz5tm8J-MoTpvSdjUtw",
    authDomain: "certify-502fb.firebaseapp.com",
    projectId: "certify-502fb",
    storageBucket: "certify-502fb.appspot.com",
    messagingSenderId: "608105229371",
    appId: "1:608105229371:web:63c2a5e5fce5d17e24401e",
    measurementId: "G-J5F3LH4E3G"
  },
  apiUrl: 'http://localhost:3005',
  VOUCHED_PUBLIC_KEY: 'mCkayd-Ug60kFINHDEO#H@y4C@#b.5',
  VOUCHED_SANDBOX_MODE: true,
  WEB3STORAGE_TOKEN: '',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
