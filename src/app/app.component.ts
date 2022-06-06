import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';
import { filter, Subject, takeUntil } from 'rxjs';
import { ThemeService } from './shared/services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  title = 'Certify';

  constructor(
    private router: Router,
    private dialogService: DialogService,
    private themeSvc: ThemeService
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
      this.dialogService.dialogComponentRefMap.forEach(dialog => {
        dialog.destroy();
      });
    });
  }
}
