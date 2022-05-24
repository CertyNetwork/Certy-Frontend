import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { Observable, map, from } from 'rxjs';
import { ContractService } from 'src/app/shared/services/certify.contract.service';

@Component({
  selector: 'app-ecosystem',
  templateUrl: './ecosystem.component.html',
  styleUrls: ['./ecosystem.component.scss']
})
export class EcosystemComponent implements OnInit {
  certForm: FormGroup;
  files: File[] = [];

  constructor(
    private fb: FormBuilder,
    private contractSvc: ContractService,
    private confirmationService: ConfirmationService
  ) {
    this.certForm = this.fb.group({
      basicInfo: fb.group({
        title: [null, [Validators.required]],
        description: [null, [Validators.required]],
      }),
      additionalInfo: fb.group({
        certification_authority_name: [null],
        major: [null],
        degree_title: [null],
        degree_classification: [null],
      }),
    });
  }

  ngOnInit(): void {
    this.contractSvc.getAllCerts().then((result) => {
      console.log(result);
    }).catch(e => console.log(e))
  }

  async connectAccount() {
    
  }

  async onSubmit () {
    if (this.certForm.invalid) {
      return;
    }

    if (!this.files.length) {
      return;
    }

    const coverImage = this.files[0];
    const { data: fileUploadResult, error: fileError } = await this.contractSvc.upload(coverImage);

    if (fileError) {
      console.error(fileError);
      return;
    }


    // setIsMinting(false);
    const { uri, hash } = fileUploadResult;
    const { basicInfo, additionalInfo } = this.certForm.value;
    this.contractSvc.mintCertificate({
      title: basicInfo.title,
      media: uri,
      description: basicInfo.description,
      issued_at: Date.now(),
      transferred: false,
      properties: {
        certification_authority_name: additionalInfo?.certification_authority_name,
        major: additionalInfo?.major,
        degree_title: additionalInfo?.degree_title,
        degree_classification: additionalInfo?.degree_classification,
        hash: hash,
      }
    }).then((result) => {
      console.log(result);
    }).catch(e => console.log(e));
  }

  onSelect(event: any) {
    console.log(event);
    if (this.files.length < 1) {
      this.files.push(...event.addedFiles);
    }
  }
  
  onRemove(event: any) {
    console.log(event);
    this.files.splice(this.files.indexOf(event), 1);
  }

  canDeactivate(): Observable<boolean> | boolean {
    if (this.certForm.dirty) {
      return from(new Promise<boolean>((rs, rj) => {
        this.confirmationService.confirm({
          message: 'You have an unsaved work. Are you sure you want to leave this page?',
          accept: () => {
            return rs(true);
          },
          reject: () => {
            return rs(false);
          }
        });
      }));
    }
    return true;
  }
}
