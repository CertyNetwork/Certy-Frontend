import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { CategoryService } from 'src/app/shared/services/category.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  categories$ = this.categoryService.categories$;
  layout: string = 'grid';
  filterText: string = '';
  destroy$ = new Subject<void>();

  constructor(
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService
  ) {
    this.route.queryParams.pipe(
      takeUntil(this.destroy$)
    ).subscribe((params) => {
      const { transactionHashes } = params;
      if (transactionHashes) {
        this.messageService.add({
          severity: 'success',
          summary: '',
          closable: true,
          detail: `Congrats, new certificate(s) has been minted successfully. TxID: ${transactionHashes}`,
        });
        this.router.navigate([this.router.url.split('?')[0]]);
      }
    });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.categoryService.getCategories();
  }

  onFilterChange() {
    // this.categoryService.updateFilter(this.filterText);
    // http://localhost:4200/dashboard?transactionHashes=AMBizcjQ85u6cJ1y7kmn7MmU1TASNJyAM3tPRUa76sSP
  }

  changeViewLayout(layout: string) {
    if (this.layout === layout) {
      return;
    }
    this.layout = layout;
  }

  getCategoryMenuItems() {
   return [
    {
      label: 'Single Mint',
      routerLink: '/create'
    },
    {
      label: 'Bulk Mint',
      routerLink: '/bulk-create'
    },
   ];
  }
}
