import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Category } from '../models/category';
import { CategoryService } from '../services/category.service';

@Injectable()
export class CategoryResolver implements Resolve<Category> {
  constructor(private categoryService: CategoryService) { }

  resolve(route: ActivatedRouteSnapshot) {
    const { categoryId } = route.params;
        
    return this.categoryService.getCategory(categoryId);
  }
}
