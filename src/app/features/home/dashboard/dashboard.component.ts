import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, map } from 'rxjs';
import { CategoryService } from 'src/app/shared/services/category.service';
import { AddCategoryComponent } from '../components/add-category/add-category.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  isMenu: boolean = false;
  isMenuBtn() {
    this.isMenu = !this.isMenu;
  }
  isSearch: boolean = false;
  categories$ = this.categoryService.categories$;
  layout: string = 'grid';
  filterText: string = '';

  constructor(
    private dialogSvc: DialogService,
    private categoryService: CategoryService
  ) { }

  ngOnInit(): void {
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

  newCategory() {
    this.dialogSvc.open(AddCategoryComponent, {
      header: 'New Category',
      width: '450px',
    });
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
