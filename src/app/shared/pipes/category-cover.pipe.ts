import { Pipe, PipeTransform } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { CategoryService } from '../services/category.service';

@Pipe({ name: 'categoryCover' })
export class CategoryCoverPipe implements PipeTransform {
  constructor(
    private categoryService: CategoryService
  ) {}

  transform(categoryId: string): Observable<string> {
    if (!categoryId) {
      return of('');
    }
    return from('');
  }
}