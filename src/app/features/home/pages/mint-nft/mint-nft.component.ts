import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { map, Observable } from 'rxjs';
import { Category } from 'src/app/shared/models/category';
import { ContractService } from 'src/app/shared/services/certify.contract.service';

@Component({
  selector: 'app-mint-nft',
  templateUrl: './mint-nft.component.html',
  styleUrls: ['./mint-nft.component.scss']
})
export class MintNftComponent implements OnInit {
  category$: Observable<Category>;
  certForm: FormGroup;
  mediaFields: any[] = [];

  constructor(
    private activeRoute: ActivatedRoute,
    private fb: FormBuilder,
    private contractSvc: ContractService
  ) {
    this.category$ = this.activeRoute.data.pipe(
      map(data => data['category'] as Category)
    );
    this.certForm = fb.group({});
  }

  ngOnInit(): void {
    this.category$.pipe(
      map(cat => cat.fields || [])
    ).subscribe(fields => {
      fields.forEach(fd => {
        this.certForm.addControl(fd.name, this.fb.control(null, fd.mandatory ? [Validators.required] : []));
        if (fd.data_type === 'media') {
          this.mediaFields.push(fd);
        }
      });
    });
  }

  async onSubmit() {
    if (this.certForm.invalid) {
      return;
    }

    // setIsMinting(true);

    const data = this.certForm.value;
    if (this.mediaFields.length) {
      for (const fd of this.mediaFields) {
        const files = data[fd.name];
        if (!files || !files.length) {
          continue;
        }

        const file = files[0];
        const { data: fileUploadResult, error: fileError } = await this.contractSvc.upload(file);
        if (fileError && fd.mandatory) {
          throw new Error(`Error while uploading file: ${file.name}`);
        } else {
          const { uri } = fileUploadResult;
          data[fd] = uri;
        }
      }
    }

    // setIsMinting(false);

    this.contractSvc.mintCertificate(data).then((result) => {
      console.log(result);
    }).catch(e => console.log(e));
  }
}
