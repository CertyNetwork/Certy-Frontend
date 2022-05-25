import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { map, Observable } from 'rxjs';
import { Category } from 'src/app/shared/models/category';
import { CertificateData } from 'src/app/shared/models/certificate-data';
import { ContractService } from 'src/app/shared/services/certify.contract.service';
import { Storage } from 'src/app/shared/services/storage';

@Component({
  selector: 'app-mint-nft',
  templateUrl: './mint-nft.component.html',
  styleUrls: ['./mint-nft.component.scss']
})
export class MintNftComponent implements OnInit {
  category$: Observable<Category>;
  categoryId: any;
  certForm: FormGroup;
  additionalFields: any[] = [];
  isMinting = false;

  constructor(
    private activeRoute: ActivatedRoute,
    private fb: FormBuilder,
    private contractSvc: ContractService,
    private storage: Storage
  ) {
    this.category$ = this.activeRoute.data.pipe(
      map(data => data['category'] as Category)
    );
    this.certForm = fb.group({
      media: [null, [Validators.required]],
      title: [null, [Validators.required]],
      description: [null, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.category$.subscribe((category: Category) => {
      this.categoryId = category.id;
      category.fields?.forEach(fd => {
        this.certForm.addControl(fd.name, this.fb.control(null, fd.mandatory ? [Validators.required] : []));
        this.additionalFields.push(fd);
      });
    });
    this.contractSvc.getOwnCerts().then(tokens => {
      console.log(tokens);
    })
  }

  async onSubmit() {
    if (this.certForm.invalid) {
      return;
    }

    const data = this.certForm.value;
    const mediaFiles = [...data['media']];
    const mediaFields = this.additionalFields.filter(fd => fd.data_type === 'media');
    if (mediaFields.length) {
      for (const fd of mediaFields) {
        const files = data[fd.name];
        if (!files || !files.length) {
          continue;
        }
        mediaFiles.push(...files);
      }
    }
    
    this.isMinting = true;

    try {
      const cid = await this.storage.uploadToWeb3Storage(mediaFiles);
      const certData: CertificateData = {
        title: data['title'],
        description: data['description'],
        media: `https://${cid}.ipfs.dweb.link/${data['media'][0].name}`,
        issued_at: Date.now()
      };
      
      if (this.additionalFields.length) {
        const reference: any = {};
        for (const fd of this.additionalFields) {
          if (fd.data_type !== 'media') {
            reference[fd.name] = data[fd.name];
          } else {
            const fileName = (data[fd.name][0] as File)?.name;
            reference[fd.name] = `https://${cid}.ipfs.dweb.link/${fileName}`;
          }
        }
        const referenceFiles = this.makeFileObjects(reference);
        const refCid = await this.storage.uploadToWeb3Storage(referenceFiles);
        certData.reference = `https://${refCid}.ipfs.dweb.link/reference.json`;
      }
  
      await this.contractSvc.mintCertificate(certData, this.categoryId);
    } catch (e) {
      console.log(e);
    } finally {
      this.isMinting = false;
    }
  }

  makeFileObjects (obj: Object) {
    // You can create File objects from a Blob of binary data
    // see: https://developer.mozilla.org/en-US/docs/Web/API/Blob
    // Here we're just storing a JSON object, but you can store images,
    // audio, or whatever you want!
    const blob = new Blob([JSON.stringify(obj)], { type: 'application/json' });
  
    const files = [
      new File([blob], 'reference.json')
    ];
    return files;
  }
}
