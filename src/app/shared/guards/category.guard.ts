import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';
import { Observable } from 'rxjs';
import { CategorySelectorComponent } from '../components/category-selector/category-selector.component';

@Injectable({
  providedIn: 'root'
})
export class CategoryGuard implements CanActivate {
  constructor(
    private dialogSvc: DialogService
  ) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      const ref = this.dialogSvc.open(CategorySelectorComponent, {
        header: 'Select a Category',
        width: '500px',
        data: {
          currentRoute: state.url
        }
      });
      return ref.onClose;
  }
}
