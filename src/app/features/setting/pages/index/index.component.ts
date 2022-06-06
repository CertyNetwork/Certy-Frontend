import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { filter, Subject, takeUntil } from 'rxjs';
import { AdDirective } from 'src/app/shared/directives/ad.directive';
import { AppShellService } from 'src/app/shared/services/app-shell.service';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit, OnDestroy {
  @ViewChild(AdDirective, {static: true}) adHost!: AdDirective;
  destroy$ = new Subject<void>();

  constructor(
    private appShellService: AppShellService,
    private router: Router
  ) { }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.router.events.pipe(
      filter(evt => evt instanceof NavigationStart),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      const viewContainerRef = this.adHost.viewContainerRef;
      viewContainerRef.clear();
    });
    this.appShellService.content$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((template) => {
      const viewContainerRef = this.adHost.viewContainerRef;
      viewContainerRef.clear();

      viewContainerRef.createEmbeddedView(template);
    });
  }
}
