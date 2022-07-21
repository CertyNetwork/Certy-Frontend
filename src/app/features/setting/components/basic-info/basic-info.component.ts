import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
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
  userType: string;
  profileForm: FormGroup;
  profileOrganizationForm: FormGroup;
  files: File[] = [];
  subs = new Subscription();
  profile$ = this.userService.profile$;
  shouldReLoad = false;
  companyTypeOptions = [
    { label: 'Product', value: 'product' },
    { label: 'OutSource', value: 'outsource' }
  ];

  constructor(
    private fb: FormBuilder,
    public userService: UserService,
    public authService: AuthService,
    private messageService: MessageService
  ) {
    this.profileForm = this.fb.group({
      displayName: [null, [Validators.required]],
      email: [null, [Validators.required, Validators.email]],
      location: [null, [Validators.required]],
      bio: [null, [Validators.required]],
      // signature: [null],
      linkedInLink: [null],
      githubLink: [null]
    });
    this.profileOrganizationForm = this.fb.group({
      companyName: [null, [Validators.required]],
      email: [null, [Validators.required, Validators.email]],
      location: [null, [Validators.required]],
      organizationType: [null, [Validators.required]],
      // signature: [null],
      workingHours: [null],
      organizationSize: [null]
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  ngOnInit(): void {
    this.subs.add(this.profile$.pipe(
      
    ).subscribe((profile => {
      this.userType = profile.userType;
      if (profile && profile.userType === 'individual') {
        this.profileForm.patchValue(profile.info);
      }
      if (profile && profile.userType === 'institution') {
        this.profileOrganizationForm.patchValue(profile.info);
      }
    })));
  }

  onSelect(event: any) {
    this.files.push(...event.addedFiles);
  }
  
  onRemove(event: any) {
    this.files.splice(this.files.indexOf(event), 1);
  }

  updateProfile() {
    if ((this.userType === 'individual' && this.profileForm.invalid) || (this.userType === 'institution ' && this.profileOrganizationForm.invalid)) {
      return;
    }
    const payload = this.userType === 'individual' ? this.profileForm.value : this.profileOrganizationForm.value;
    this.userService.updateUserProfile(this.userType, payload).then(() => {
      this.messageService.add({
        severity: 'success',
        summary: `Profile has been updated successfully`,
      });
    });
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
    // await this.userService.removeAvatarImage();
    // this.shouldReLoad = !this.shouldReLoad;
  }
}
