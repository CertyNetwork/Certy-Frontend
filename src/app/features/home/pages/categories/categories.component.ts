import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { CategoryService } from 'src/app/shared/services/category.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit, OnDestroy {
  categories$ = this.categoryService.categories$;
  layout: string = 'grid';
  filterText: string = '';
  destroy$ = new Subject<void>();

  constructor(
    private messageService: MessageService,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router
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
          detail: `Congrats, new category has been minted successfully. TxID: ${transactionHashes}`,
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
