import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FileUpload } from 'primeng/fileupload';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { UserService } from 'src/app/shared/services/user.service';

@Component({
  selector: 'app-basic-info',
  templateUrl: './basic-info.component.html',
  styleUrls: ['./basic-info.component.scss'],
})
export class BasicInfoComponent implements OnInit, OnDestroy {
  profileForm: FormGroup;
  files: File[] = [];
  subs = new Subscription();
  profile$ = this.userService.profile$;
  shouldReLoad = false;

  constructor(
    private fb: FormBuilder,
    public userService: UserService,
    public authService: AuthService,
  ) {
    this.profileForm = this.fb.group({
      display_name: [null, [Validators.required]],
      email: [null, [Validators.required, Validators.email]],
      location: [null, [Validators.required]],
      bio: [null, [Validators.required]],
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  ngOnInit(): void {
    this.subs.add(this.profile$.pipe(
      
    ).subscribe((profile => {
      if (profile) {
        this.profileForm.patchValue(profile);
      }
    })));
    this.userService.getUserProfile();
  }

  onSelect(event: any) {
    this.files.push(...event.addedFiles);
  }
  
  onRemove(event: any) {
    this.files.splice(this.files.indexOf(event), 1);
  }

  updateProfile() {
    if (this.profileForm.invalid) {
      return;
    }
    this.userService.updateUserProfile(this.profileForm.value)
  }

  async uploadAvatar(event: any, uploader: FileUpload) {
    const { files } = event;
    if (!files || !files.length) {
      return;
    }

    const file = files[0];
    uploader.clear();
    await this.userService.uploadAvatarImage(file);
    this.shouldReLoad = !this.shouldReLoad;
  }

  async removeAvatar() {
    await this.userService.removeAvatarImage();
    this.shouldReLoad = !this.shouldReLoad;
  }
}
