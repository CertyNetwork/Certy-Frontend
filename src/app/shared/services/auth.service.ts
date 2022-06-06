import { Injectable } from '@angular/core';
import { BehaviorSubject, from, mergeMap, Observable } from 'rxjs';
import { connect, keyStores, WalletConnection, ConnectConfig, utils, providers } from "near-api-js";
import { environment } from 'src/environments/environment';
import { AccountView } from 'near-api-js/lib/providers/provider';

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
  provider = new providers.JsonRpcProvider(environment.nodeUrl);

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

    // http://localhost:4200/?account_id=gile.testnet&public_key=ed25519%3A9i3NZzFLFEL1x6mwBuyacVrzZFye9CCcqEJsRfvUgrJD&all_keys=ed25519%3AA4PUo9YcaojcNPeQRAn3CYeoqvWmAtgS6A3tCcC9BpP5
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

  public checkIfWalletIdNotExists(walletId: string): Observable<boolean> {
    return from((async () => {
      try {
        const accountInfo = await this.provider.query<AccountView>({
          request_type: "view_account",
          account_id: walletId,
          finality: "final",
        });
        return !accountInfo;
      } catch (e) {
        return true;
      }
    })());
  }
}
