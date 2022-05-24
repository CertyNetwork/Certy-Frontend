import { Injectable } from '@angular/core';
import { BehaviorSubject, mergeMap } from 'rxjs';
import { connect, keyStores, WalletConnection, ConnectConfig, utils } from "near-api-js";
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  authenticateSubject = new BehaviorSubject<boolean>(false);
  authenticated$ = this.authenticateSubject.asObservable();
  account$ = this.authenticated$.pipe(
    mergeMap(async authenticated => {
      if (!authenticated) {
        return null;
      }
      const account = this.wallet?.account();
      const balance = await account?.getAccountBalance();
      return {
        accountId: account?.accountId,
        balance: utils.format.formatNearAmount(balance? balance.available : "0", 2) + ' N',
      };
    })
  );
  wallet: WalletConnection | null = null;

  constructor() {
    const config: ConnectConfig = {
      networkId: environment.networkId,
      keyStore: new keyStores.BrowserLocalStorageKeyStore(),
      nodeUrl: environment.nodeUrl,
      walletUrl: environment.walletUrl,
      headers: {},
    };
    
    // connect to NEAR
    connect(config).then((near) => {
      this.wallet = new WalletConnection(near, '');
      if (this.wallet.isSignedIn()) {
        this.authenticateSubject.next(true);
      }
    });
  }

  async signIn() {
    if (!this.wallet) {
      return;
    }
    await this.wallet.requestSignIn(
      environment.contractName, // contract requesting access
      "Certify", // optional
    );

    if (this.wallet.isSignedIn()) {
      this.authenticateSubject.next(true);
    }
  }

  signOut() {
    if (this.wallet) {
      this.wallet.signOut();
      this.authenticateSubject.next(false);
    }
  };

  isLoggedIn() {
    if (!this.wallet) {
      return false;
    }
    return this.wallet.isSignedIn();
  }
}
