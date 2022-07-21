import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { filter, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { UserService } from '../../services/user.service';

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
  profile$ = this.account$.pipe(
    filter(acc => !!acc),
    // tap(() => this.userService.getUserProfile()),
    switchMap(() => this.userService.profile$)
  );
  accountMenuItems: MenuItem[] = [
    {
      label: 'Disconnect',
      icon: 'pi pi-sign-out',
      command: () => {
        this.authSvc.signOut();
        this.router.navigate(['/']);
      }
    },
  ];
  // createItems: MenuItem[] = [
  //   {
  //     label: 'Single Mint',
  //     routerLink: '/create'
  //   },
  //   {
  //     label: 'Bulk Mint',
  //     routerLink: '/bulk-create'
  //   },
  // ];
  theme$ = this.themeService.theme$;

  constructor(
    private authSvc: AuthService,
    private userService: UserService,
    private router: Router,
    private themeService: ThemeService
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

  switchMode(theme: string) {
    this.themeService.changeTheme(theme);
  }
}
