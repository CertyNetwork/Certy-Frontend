import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, from, map, mergeMap, Observable, of, switchMap, take, withLatestFrom } from 'rxjs';
import { connect, keyStores, WalletConnection, ConnectConfig, utils, providers } from "near-api-js";
import { environment } from 'src/environments/environment';
import { AccountView } from 'near-api-js/lib/providers/provider';
import { HttpClient } from '@angular/common/http';
import { CookieService } from './cookie.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  isRefreshing = false;
  authenticateSubject = new BehaviorSubject<boolean>(false);
  beAuthenticateSubject = new BehaviorSubject<boolean>(this.isBeAuthenticate());
  authenticated$ = this.authenticateSubject.asObservable();
  beAuthenticated$ = this.beAuthenticateSubject.asObservable();
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
  wallet?: WalletConnection;
  provider = new providers.JsonRpcProvider(environment.nodeUrl);

  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) {
    const config: ConnectConfig = {
      networkId: environment.networkId,
      keyStore: new keyStores.BrowserLocalStorageKeyStore(),
      nodeUrl: environment.nodeUrl,
      walletUrl: environment.walletUrl,
      headers: {},
    };
    
    // connect to NEAR
    connect(config).then(async (near) => {
      this.wallet = new WalletConnection(near, '');
      if (this.wallet.isSignedIn()) {
        this.authenticateSubject.next(true);
        const accountId = this.wallet.getAccountId();
        const isBeAuthenticated = this.beAuthenticateSubject.value;
        if (!isBeAuthenticated) {
          this.http.get(`${environment.apiUrl}/auth/get-nonce/${accountId}`).pipe(
            take(1),
            map((res: any) => res.data.nonce),
            withLatestFrom(this.wallet._keyStore.getKey(environment.networkId, accountId)),
            switchMap(([nonce, keypair]) => {
              if (!keypair) {
                return of({
                  data: null
                });
              }
            
              const message = Buffer.from(nonce);
              const signed = keypair.sign(message);
              const signature = Buffer.from(signed.signature).toString('base64');
  
              return this.http.post(`${environment.apiUrl}/auth`, {
                accountId: accountId,
                signature,
                publicKey: keypair.getPublicKey().toString()
              });
            })
          ).subscribe(({ data }: any) => {
            this.setAccessToken(data?.accessToken);
            this.setRefreshToken(data?.refreshToken);
            this.beAuthenticateSubject.next(true);
          });
        }
      }
    });
  }

  isBeAuthenticate(): boolean {
    try {
      const accessToken = this.getAccessToken();
      const tknInfo = JSON.parse(atob(accessToken.split('.')[1]));

      if (!tknInfo || !tknInfo.accountId) {
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  async signIn() {
    if (!this.wallet || this.wallet.isSignedIn()) {
      return;
    }
    await this.wallet.requestSignIn(
      environment.contractName, // contract requesting access
      "Certify", // optional
    );
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

  setAccessToken(token?: string): void {
    if (!token) {
      this.cookieService.remove('ACCESS_TOKEN');
    }
    this.cookieService.set('ACCESS_TOKEN', token);
  }

  getAccessToken(): string {
    const token = this.cookieService.get('ACCESS_TOKEN');
    return token;
  }

  setRefreshToken(token?: string): void {
    if (!token) {
      this.cookieService.remove('REFRESH_TOKEN');
    }
    this.cookieService.set('REFRESH_TOKEN', token);
  }

  getRefreshToken() {
    return this.cookieService.get('REFRESH_TOKEN');
  }

  refreshAccessToken(refreshToken: string) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);
      return this.http.post<any>(`${environment.apiUrl}/auth/refresh-token`, {
        refreshToken
      }).pipe(
        map(res => {
          this.isRefreshing = false;
          const { accessToken } = res.data;
          this.setAccessToken(accessToken);
          this.refreshTokenSubject.next(accessToken);
          return accessToken;
        }),
        take(1)
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
      );
    }
  }

  logout() {
    this.cookieService.get('ACCESS_TOKEN');
    this.cookieService.get('REFRESH_TOKEN');
  }
}
