import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import * as uuid from 'uuid';
import { Category } from '../models/category';
import { ContractService } from './certify.contract.service';
import { Storage } from './storage';


@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private categories = new Subject<Category[]>();
  private addingCategory = new BehaviorSubject<boolean>(false);
  public categories$ = this.categories.asObservable();
  public addingCategory$ = this.addingCategory.asObservable();
  filterCategoriesSubject = new BehaviorSubject<string>('');

  constructor(
    private contractService: ContractService,
    private storage: Storage
  ) {
  }

  /**
   * Get user categories
   * @param metadata metadata object
   * @returns category
   */
   public async getCategories() {
    try {
      const categories = await this.contractService.getCategories();
      this.categories.next(categories);
    } catch(e) {
      console.log(e);
    }
  }

  async getCategory(categoryId: string): Promise<Category> {
    const category = await this.contractService.getCategory(categoryId);
    if (!category) {
      throw new Error('Could not found the corresponding category');
    }
    return category;
  }

  /**
   * Update user profile
   * @param metadata metadata object
   * @returns user profile
   */
   public async addCategory(category: Category): Promise<any> {
    try {
      this.addingCategory.next(true);
      const { raw_image, ...cat } = category;

      cat.id = uuid.v4();
      
      if (raw_image) {
        const cid = await this.storage.uploadToWeb3Storage([raw_image]);
        cat.media = `https://${cid}.ipfs.dweb.link/${raw_image.name}`;
      }

      await this.contractService.createCategory(cat);

      setTimeout(() => {
        this.getCategories();
      }, 1000);
    } catch(e) {
      console.log(e);
    } finally {
      this.addingCategory.next(false);
    }
  }

  public async updateCategory(category: Category): Promise<any> {
    try {
      this.addingCategory.next(true);
      const { raw_image, ...cat } = category;
      
      if (raw_image) {
        const cid = await this.storage.uploadToWeb3Storage([raw_image]);
        cat.media = `https://${cid}.ipfs.dweb.link/${raw_image.name}`;
      }

      await this.contractService.createCategory(cat);

      setTimeout(() => {
        this.getCategories();
      }, 1000);
    } catch(e) {
      console.log(e);
    } finally {
      this.addingCategory.next(false);
    }
  }


  public updateFilter(fitterText: string) {
    this.filterCategoriesSubject.next(fitterText);
  }
}