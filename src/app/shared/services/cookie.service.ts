import { PlatformService } from './platform.service';
import { Injectable, Injector } from '@angular/core';
import { CookieAttributes } from 'js-cookie';
import Cookies from 'js-cookie';
import { environment } from '../../../environments/environment';

export interface ICookieService {

  get(name: string): any;

  set(name: string, value: any, options?: CookieAttributes): void;

  remove(name: string, options?: CookieAttributes): void;
}

@Injectable({
  providedIn: 'root'
})
export class CookieService implements ICookieService {
  constructor(private platformService: PlatformService, private injector: Injector) {

  }

  public set(name: string, value: any, options?: CookieAttributes): void {
    if (this.platformService.isBrowser) {
      if (environment.production) {
        if (!options) {
          options = { secure: true };
        }
        if (!options.secure) {
          options.secure = true;
        }
      }
      Cookies.set(name, value, options);
    }
  }

  public remove(name: string, options?: CookieAttributes): void {
    if (this.platformService.isBrowser) {
      Cookies.remove(name, options);
    }
  }

  public get(name: string): any {
    if (this.platformService.isBrowser) {
      return Cookies.get(name);
    } else {
      // try {
      //   const req: express.Request = this.injector.get(REQUEST);
      //   return req.cookies[name];
      // } catch (err) {
      //   return null;
      // }
      return null;
    }
  }
}
