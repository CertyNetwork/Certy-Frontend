import { Injectable } from '@angular/core';
import { FirebaseApp, initializeApp, getApp } from 'firebase/app';
import { getFirestore, collection, Firestore, getDoc, doc, setDoc, DocumentReference } from 'firebase/firestore';
import { FirebaseStorage, getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { BehaviorSubject } from 'rxjs';
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
  private profile = new BehaviorSubject<Profile | null>(null);
  private updatingProfile = new BehaviorSubject<boolean>(false);
  public profile$ = this.profile.asObservable();
  public updatingProfile$ = this.updatingProfile.asObservable();
  private PROFILE_COLLECTION_NAME = 'profiles';

  constructor(
    private authService: AuthService
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

    this.getUserProfile().then((profile) => {
      this.profile.next(profile as Profile);
    });
  }

  /**
   * Get user profile
   * @param metadata metadata object
   * @returns user profile
   */
   public async getUserProfile(): Promise<any> {
    if (!this.store) {
      return;
    }
    try {
      const profileCollection = collection(this.store, this.PROFILE_COLLECTION_NAME);
      const docRef = doc(this.store, profileCollection.path, this.authService.wallet?.getAccountId());
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return data;
      }
      return null;
    } catch(e) {
      console.log(e);
    }
  }

  /**
   * Update user profile
   * @param metadata metadata object
   * @returns user profile
   */
   public async updateUserProfile(profile: any): Promise<any> {
    if (!this.store) {
      return;
    }
    try {
      this.updatingProfile.next(true);
      const profileCollection = collection(this.store, this.PROFILE_COLLECTION_NAME);
      const docRef = doc(this.store, profileCollection.path, this.authService.wallet?.getAccountId());
      await setDoc(docRef, profile);
    } catch(e) {
      console.log(e);
    } finally {
      this.updatingProfile.next(false);
    }
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
    if (!this.storage) {
      return;
    }
    try {
      const storageRef = ref(this.storage, `${this.PROFILE_COLLECTION_NAME}/${accountId}`);
      const result = await getDownloadURL(storageRef);
      return result;
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