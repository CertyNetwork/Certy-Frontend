import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FirebaseApp, initializeApp, getApp } from 'firebase/app';
import { getFirestore, collection, Firestore, getDoc, doc, setDoc, DocumentReference } from 'firebase/firestore';
import { FirebaseStorage, getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { MessageService } from 'primeng/api';
import { BehaviorSubject, Subject, take, catchError, of, map, lastValueFrom, ReplaySubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Profile } from '../models/profile';
import { AuthService } from './auth.service';


@Injectable({
  providedIn: 'root'
})
export class UserService {
  public firebase: FirebaseApp | undefined;
  public store: Firestore | undefined;
  public storage: FirebaseStorage | undefined;
  private profile = new ReplaySubject<Profile>(5);
  private updatingProfile = new BehaviorSubject<boolean>(false);
  public profile$ = this.profile.asObservable();
  public updatingProfile$ = this.updatingProfile.asObservable();
  private PROFILE_COLLECTION_NAME = 'profiles';

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private messageService: MessageService
  ) {
    // let certifyFirebase;
    // try {
    //   certifyFirebase = getApp('certify-web');
    // } catch(e) {
    //   console.log(e);
    // }

    // this.firebase = certifyFirebase ?? initializeApp(environment.firebaseConfig, 'certify-web');

    // this.store = getFirestore(this.firebase);
    // this.storage = getStorage(this.firebase);
    this.getUserProfile();
  }

  /**
   * Get user profile
   * @param metadata metadata object
   * @returns user profile
   */
   public async getUserProfile(): Promise<any> {
    const info = await lastValueFrom(this.http.get(`${environment.apiUrl}/profile/me`).pipe(
      take(1),
      catchError((e) => {
        return of(null);
      }),
      map(({data}: any) => data)
    ));
    this.profile.next(info);
  }

  /**
   * Update user profile
   * @param metadata metadata object
   * @returns user profile
   */
   public async updateUserProfile(userType: string, profile: any): Promise<any> {
    const apiUrl = userType === 'individual' ? `${environment.apiUrl}/profile/me/individual-info` : `${environment.apiUrl}/profile/me/organization-info`;
    this.updatingProfile.next(true);
    this.http.post(apiUrl, profile).subscribe({
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: `Error while updating profile`,
        });
      },
      complete: () => {
        this.updatingProfile.next(false);
      }
    });
  }

  public async getProfileRef(): Promise<DocumentReference | null> {
    if (!this.store) {
      return null;
    }
    const profileCollection = collection(this.store, this.PROFILE_COLLECTION_NAME);
    const profileRef = doc(this.store, profileCollection.path, this.authService.wallet?.getAccountId());
    return profileRef;
  }

  public async uploadAvatarImage(image: File): Promise<any> {
    if (!this.storage) {
      return;
    }
    try {
      const storageRef = ref(this.storage, `${this.PROFILE_COLLECTION_NAME}/${this.authService.wallet?.getAccountId()}`);
      const buffer = await image.arrayBuffer();
      await uploadBytes(storageRef, buffer, { contentType: image.type });
    } catch (e) {
      console.log(e);
    }
  }

  public async getAvatarUrl(accountId: string): Promise<any> {
    try {
      const res = await lastValueFrom(this.http.get<any>(`${environment.apiUrl}/profile/me/avatar`));
      return res.data.src;
    } catch (e) {
      console.log(e);
      return '/assets/images/empty.jpeg';
    }
  }

  public async removeAvatarImage() {
    if (!this.storage) {
      return;
    }
    try {
      const storageRef = ref(this.storage, `${this.PROFILE_COLLECTION_NAME}/${this.authService.wallet?.getAccountId()}`);
      await deleteObject(storageRef);
    } catch (e) {
      console.log(e);
    }
  }
}