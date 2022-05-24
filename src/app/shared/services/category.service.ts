import { Injectable, OnDestroy } from '@angular/core';
import { FirebaseApp, initializeApp, getApp } from 'firebase/app';
import { getFirestore, collection, Firestore, getDocs, addDoc, query, doc, getDoc, where } from 'firebase/firestore';
import { FirebaseStorage, getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { BehaviorSubject, debounceTime, distinctUntilChanged, map, Subject, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Category } from '../models/category';
import { UserService } from './user.service';


@Injectable({
  providedIn: 'root'
})
export class CategoryService implements OnDestroy {
  public firebase: FirebaseApp | undefined;
  public store: Firestore | undefined;
  public storage: FirebaseStorage | undefined;
  private categories = new Subject<Category[]>();
  private addingCategory = new BehaviorSubject<boolean>(false);
  public categories$ = this.categories.asObservable();
  public addingCategory$ = this.addingCategory.asObservable();
  private CATEGORY_COLLECTION_PATH = 'categories';
  private CATEGORY_FOLDER = 'categories';
  filterCategoriesSubject = new BehaviorSubject<string>('');
  subs: Subscription = new Subscription();

  constructor(
    private userService: UserService
  ) {
    let certifyFirebase;
    try {
      certifyFirebase = getApp('certify-web');
    } catch(e) {
      console.log(e);
    }

    this.firebase = certifyFirebase ?? initializeApp(environment.firebaseConfig, 'certify-web');

    this.store = getFirestore(this.firebase);
    this.storage = getStorage(this.firebase);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  /**
   * Get user profile
   * @param metadata metadata object
   * @returns user profile
   */
   public async getCategories(searchString?: string) {
    if (!this.store) {
      return;
    }
    try {
      const profileRef = await this.userService.getProfileRef();

      if (!profileRef) {
        return;
      }

      const categoryCollection = collection(profileRef, this.CATEGORY_COLLECTION_PATH);

      const categoryQuery = searchString
        ? query(categoryCollection, where("title", 'array-contains', searchString))
        : query(categoryCollection);

      const categoryDocs = await getDocs(categoryQuery);
      
      if (!categoryDocs.docs.length) {
        this.categories.next([]);
      }

      const categories = categoryDocs.docs.map(d => ({id: d.id, ...d.data()}) as Category);
      this.categories.next(categories);
    } catch(e) {
      console.log(e);
    }
  }

  async getCategory(categoryId: string): Promise<Category> {
    const profileRef = await this.userService.getProfileRef();
    if (!profileRef) {
      throw new Error('Not found the category')
    }
    const categoryCollection = collection(profileRef, this.CATEGORY_COLLECTION_PATH);
    const categoryDocRef = await doc(categoryCollection, categoryId);
    const categoryDoc = await getDoc(categoryDocRef);
    if (!categoryDoc.exists()) {
      throw new Error('Not found the category')
    }
    return categoryDoc.data() as Category;
  }

  /**
   * Update user profile
   * @param metadata metadata object
   * @returns user profile
   */
   public async addCategory(category: Category): Promise<any> {
    if (!this.store) {
      return;
    }
    try {
      this.addingCategory.next(true);
      const profileRef = await this.userService.getProfileRef();
      if (!profileRef) {
        return;
      }
      const { raw_image, ...cat } = category;
      const categoryCollection = collection(profileRef, this.CATEGORY_COLLECTION_PATH);
      const addedCategory = await addDoc(categoryCollection, cat);
      if (!category) {
        return;
      }
      const { id: categoryId } = addedCategory;
      this.uploadCoverImage(categoryId, raw_image!).catch(e => {
        console.log(e);
      });

      // reload categories
      setTimeout(() => {
        this.getCategories();
      }, 500);
      return categoryId;
    } catch(e) {
      console.log(e);
    } finally {
      this.addingCategory.next(false);
    }
  }

  private async uploadCoverImage(categoryId: string, image: File): Promise<any> {
    if (!this.storage) {
      return;
    }
    try {
      const storageRef = ref(this.storage, `${this.CATEGORY_FOLDER}/${categoryId}`);
      const buffer = await image.arrayBuffer();
      uploadBytes(storageRef, buffer, { contentType: image.type });
    } catch (e) {
      console.log(e);
    }
  }

  public async getCoverUrl(categoryId: string): Promise<any> {
    if (!this.storage) {
      return;
    }
    try {
      const storageRef = ref(this.storage, `${this.CATEGORY_FOLDER}/${categoryId}`);
      const result = await getDownloadURL(storageRef);
      return result;
    } catch (e) {
      console.log(e);
    }
  }

  public async getSampleCsv(categoryId: string): Promise<any> {
    if (!this.storage) {
      return;
    }
    try {
      const storageRef = ref(this.storage, `${this.CATEGORY_FOLDER}/${categoryId}`);
      const result = await getDownloadURL(storageRef);
      return result;
    } catch (e) {
      console.log(e);
    }
  }

  public updateFilter(fitterText: string) {
    this.filterCategoriesSubject.next(fitterText);
  }
}