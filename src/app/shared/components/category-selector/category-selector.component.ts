import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-category-selector',
  templateUrl: './category-selector.component.html',
  styleUrls: ['./category-selector.component.scss']
})
export class CategorySelectorComponent implements OnInit {
  categories$ = this.categoryService.categories$;
  selectedCategory: any;

  constructor(
    private ref: DynamicDialogRef,
    private categoryService: CategoryService,
    private router: Router,
    private fd: DynamicDialogConfig
  ) { }

  ngOnInit(): void {
    this.categoryService.getCategories();
  }

  onSelect(categoryId: any) {
    if (!categoryId) {
      return;
    }
    const {currentRoute} = this.fd.data;
    this.ref.close(categoryId);
    this.router.navigate([`${currentRoute}/${categoryId}`], { replaceUrl: true });
  }

  newCategory() {
    this.ref.close();
    this.router.navigate(['/category-new'], { replaceUrl: true });
  }
}
