import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { environment } from 'src/environments/environment';


@Injectable()
export class ProfileService {
  private profile = new Subject<any>();
  private updatingProfile = new BehaviorSubject<boolean>(false);
  public profile$ = this.profile.asObservable();
  public updatingProfile$ = this.updatingProfile.asObservable();

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) {
    
  }

  /**
   * Get user profile
   * @param metadata metadata object
   * @returns user profile
   */
   public async getUserProfile(): Promise<void> {
    this.profile.next({
      user_type: 'individual',
      display_name: '',
      email: '',
      location: '',
      bio: '',
      kyc_status: 'unverified',
      created_at: 0
    });
  }

  /**
   * Update user profile
   * @param metadata metadata object
   * @returns user profile
   */
   public async updateUserProfile(profile: any): Promise<void> {
    try {
      this.updatingProfile.next(true);
      
    } catch(e) {
      console.log(e);
    } finally {
      this.updatingProfile.next(false);
    }
  }

  public async uploadAvatarImage(image: File): Promise<any> {
    try {
      
    } catch (e) {
      console.log(e);
    }
  }

  public async getAvatarUrl(accountId: string): Promise<any> {
    try {
      const result = '';
      return result;
    } catch (e) {
      return '/assets/images/empty.jpeg';
    }
  }

  public async removeAvatarImage() {
    try {
      //
    } catch (e) {
      console.log(e);
    }
  }
}