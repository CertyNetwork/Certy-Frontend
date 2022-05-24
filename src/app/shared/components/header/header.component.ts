import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { filter, map, Subject, switchMap, takeUntil } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  isOpen: boolean = false;
  authenticated$ = this.authSvc.authenticated$;
  account$ = this.authSvc.account$;
  accountMenuItems: MenuItem[] = [
    {
      label: 'Profile',
      icon: 'pi pi-user',
      routerLink: '/setting'
    },
    {
      label: 'Disconnect',
      icon: 'pi pi-sign-out',
      command: () => {
        this.authSvc.signOut();
      }
    },
  ];
  createItems: MenuItem[] = [
    {
      label: 'Single Mint',
      routerLink: '/create'
    },
    {
      label: 'Bulk Mint',
      routerLink: '/bulk-create'
    },
  ];

  constructor(
    private authSvc: AuthService,
    private router: Router
  ) { }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete(); 
  }

  ngOnInit(): void {
   this.router.events.pipe(
      filter(evt => evt instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.isOpen = false;
    });
  }

  connect() {
    this.authSvc.signIn();
  }
}
