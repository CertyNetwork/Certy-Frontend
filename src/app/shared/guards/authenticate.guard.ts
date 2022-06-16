import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanLoad, Route, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';
import { Observable } from 'rxjs';
import { NearLoginComponent } from '../components/near-login/near-login.component';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticateGuard implements CanActivate, CanLoad {
  constructor(
    private authService: AuthService,
    private dialogSvc: DialogService
  ) {
  }
  
  canLoad(route: Route, segments: UrlSegment[]): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    const isLoggedIn = this.authService.isLoggedIn();
      if (!isLoggedIn) {
        this.openLoginDialog();
      }
      return isLoggedIn;
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      const isLoggedIn = this.authService.isLoggedIn();
      if (!isLoggedIn) {
        this.openLoginDialog();
      }
      return isLoggedIn;
  }
  
  private openLoginDialog() {
    this.dialogSvc.open(NearLoginComponent, {
      header: 'NEAR is here',
      width: '450px',
      styleClass: 'tw-rounded-b-md',
    });
  }
}
