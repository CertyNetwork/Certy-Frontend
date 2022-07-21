import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { from, map, Observable, Subject, takeUntil } from 'rxjs';
import { WalletIdValidator } from 'src/app/shared/directives/wallet_id.validator';
import { Category } from 'src/app/shared/models/category';
import { CertificateData } from 'src/app/shared/models/certificate-data';
import { ContractService } from 'src/app/shared/services/certify.contract.service';
import { Storage } from 'src/app/shared/services/storage';

@Component({
  selector: 'app-mint-nft',
  templateUrl: './mint-nft.component.html',
  styleUrls: ['./mint-nft.component.scss']
})
export class MintNftComponent implements OnInit, OnDestroy {
  category$: Observable<Category>;
  categoryId: any;
  certForm: FormGroup;
  additionalFields: any[] = [];
  isMinting = false;
  destroy$ = new Subject<void>();

  constructor(
    private activeRoute: ActivatedRoute,
    private fb: FormBuilder,
    private contractSvc: ContractService,
    private walletIdValidator: WalletIdValidator,
    private storage: Storage,
    private confirmationService: ConfirmationService
  ) {
    this.category$ = this.activeRoute.data.pipe(
      map(data => data['category'] as Category)
    );
    this.certForm = fb.group({
      walletId: fb.control(null, {
        validators: [Validators.required],
        asyncValidators: [this.walletIdValidator.validate.bind(this.walletIdValidator)],
        updateOn: 'blur',
      }),
      media: [null, [Validators.required]],
      title: [null, [Validators.required]],
      description: [null, [Validators.required]]
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.category$.pipe(takeUntil(this.destroy$)).subscribe((category: Category) => {
      this.categoryId = category.id;
      category.fields?.forEach(fd => {
        this.certForm.addControl(fd.name, this.fb.control(null, fd.mandatory ? [Validators.required] : []));
        this.additionalFields.push(fd);
      });
    });
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
      const cid = await this.storage.upload(mediaFiles, {
        scene: 'cert_mint',
        category_id: this.categoryId,
        wallet_id: data['walletId']
      });
      const certData: CertificateData = {
        title: data['title'],
        description: data['description'],
        media: `https://${cid}.ipfs.dweb.link/${data['media'][0].name}`,
        issued_at: Date.now(),
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
        const refCid = await this.storage.upload(referenceFiles);
        certData.reference = `https://${refCid}.ipfs.dweb.link/reference.json`;
      }
  
      await this.contractSvc.mintCertificate(certData, this.categoryId, data['walletId']);
    } catch (e) {
      console.log(e);
    } finally {
      this.isMinting = false;
    }
  }

  makeFileObjects(obj: Object) {
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

  get walletId() { return this.certForm.get('walletId'); }

  canDeactivate(): Observable<boolean> | boolean {
    if (this.certForm.dirty) {
      return from(new Promise<boolean>((rs, rj) => {
        this.confirmationService.confirm({
          message: 'You have a pending work. Are you sure you want to leave this page?',
          accept: () => {
            return rs(true);
          },
          reject: () => {
            return rs(false);
          },
          acceptButtonStyleClass: 'p-button-info',
          rejectButtonStyleClass: 'p-button-secondary mr-5'
        });
      }));
    }
    return true;
  }
}
