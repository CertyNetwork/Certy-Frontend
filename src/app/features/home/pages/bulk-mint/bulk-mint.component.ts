import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Papa } from 'ngx-papaparse';
import {
  from, fromEvent, lastValueFrom,
  map, Observable, Subscription, tap
} from 'rxjs';
import {
  debounceTime,
  switchMap,
} from 'rxjs/operators';
import * as uuid from 'uuid';
import { ContractService } from 'src/app/shared/services/certify.contract.service';
import { Category } from 'src/app/shared/models/category';
import { AuthService } from 'src/app/shared/services/auth.service';
import { Storage } from 'src/app/shared/services/storage';

@Component({
  selector: 'app-bulk-mint',
  templateUrl: './bulk-mint.component.html',
  styleUrls: ['./bulk-mint.component.scss']
})
export class BulkMintComponent implements OnInit {
  EXTRACT_TYPE_REGEXP = /^\s*([^;\s]*)(?:;|\s|$)/;
  category$: Observable<Category>;
  sampling = false;
  step: 'select_file' | 'preview' | 'processing' = 'select_file';
  files: File[] = [];
  mediaFiles: {
    [key: string]: File
  } = {};
  rowData: any[] = [];
  fileLoading: boolean = false;
  fileProcessing: boolean = false;
  cols: any[] = [];
  private subs = new Subscription();

  constructor(
    private contractSvc: ContractService,
    private confirmationService: ConfirmationService,
    private papa: Papa,
    private activeRoute: ActivatedRoute,
    private authService: AuthService,
    private storage: Storage,
    private messageService: MessageService
  ) {
    this.category$ = this.activeRoute.data.pipe(
      map(data => data['category'] as Category)
    );
  }

  ngOnInit(): void {
    //
  }

  onSelect(event: any) {
    this.files = event.addedFiles;
  }
  
  onRemove(event: any) {
    this.files.splice(this.files.indexOf(event), 1);
  }

  canDeactivate(): Observable<boolean> | boolean {
    if (this.fileProcessing) {
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

  preview() {
    if (!this.files || !this.files.length) {
      return
    }
    this.fileLoading = true;
    this.papa.parse(this.files[0], {
      complete: (result) => {
        this.fileLoading = false;
        this.step = 'preview';
        this.cols = result.meta.fields.map(f => ({ field: f, header: f.toLocaleUpperCase() })),
        this.rowData = result.data.filter((dt: any) => dt && dt.walletId && dt.title && dt.media).map((dt: any) => ({
          ...dt,
          validate_status: 'PENDING'
        }));
        this.validateData();
      },
      error: () => {
        this.fileLoading = false;
        this.cols = [],
        this.rowData = [];
      },
      worker: true,
      header: true,
    });
  }

  async validateData() {
    for (let i = 0; i < this.rowData.length; i++) {
      const row = this.rowData[i];
      if (!row.walletId || !row.title || !row.media || !row.description) {
        row.validate_status = 'ERROR';
        row.validate_error = 'Incorrect data';
        continue;
      }

      // check walletId
      const isWalletIdNotExist = await lastValueFrom(this.authService.checkIfWalletIdNotExists(row.walletId));
      if (isWalletIdNotExist) {
        row.validate_status = 'ERROR';
        row.validate_error = 'Invalid Wallet Id';
        continue;
      }

      // check media
      if (!this.mediaFiles[row.media]) {
        const isValidMedia = await fetch(row.media, {
          mode: 'no-cors'
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Not found');
          }
          return response.blob();
        })
        .then(blob => {
          this.mediaFiles[row.media] = new File([blob], `${uuid.v4()}`);
          return true;
        })
        .catch((e) => {
          console.log(e);
          return false;
        });

        if (!isValidMedia) {
          row.validate_status = 'ERROR';
          row.validate_error = 'Invalid media filed';
          continue;
        }
      }

      row.validate_status = 'READY';
    }
  }

  async process(category: Category) {
    const validCerts = this.rowData.filter(dt => dt.validate_status === 'READY');
    if (!validCerts || !validCerts.length) {
      return;
    }

    this.fileProcessing = true;
    const now = Date.now();

    const files = Object.values(this.mediaFiles);
    const additionalFields = category.fields || [];
    const receiverIds = validCerts.map(dt => dt.walletId);

    try {
      const cid = await this.storage.upload(files, {
        scene: 'bulk_cert_mint',
        category_id: category.id || ''
      });
    
      const metaDatas = validCerts.map(dt => {
        const reference: any = {};
        for (const fd of additionalFields) {
          reference[fd.name] = dt[fd.name];
        }
        return {
          title: dt.title,
          description: dt.description,
          media: `https://${cid}.ipfs.dweb.link/${this.mediaFiles[dt.media].name}`,
          issued_at: now,
          reference: JSON.stringify(reference),
        };
      });
  
      await this.contractSvc.bulkMintCertificate(receiverIds, metaDatas, category.id);
    } catch (e: any) {
      this.messageService.add({
        severity: 'error',
        summary: `Error while bulk minting: ${e.message}`,
      });
    } finally {
      this.fileProcessing = false;
    }
  }

  @ViewChild('downloadSampleButton') set downloadSampleButton(content: ElementRef) {
    if (content) {
      this.subs.add(fromEvent(content.nativeElement, 'click').pipe(
        tap(() => {
          this.sampling = true;
        }),
        debounceTime(1000),
        switchMap(() => this.category$),
      ).subscribe((category) => {
        const fields = category.fields;
       
        if (fields?.length) {
          const sampleData = fields?.reduce((a: any, c) => {
            a[c.name] = `${c.label} (${c.data_type})`;
            return a;
          }, {
            walletId: 'Sample walletId.',
            title: 'Sample title',
            description: 'Sample description',
            media:  'Sample media url',
          });
          const csvData = this.papa.unparse([sampleData], {
            header: true,
          });

          const a = document.createElement('a');
          const blob = new Blob([csvData], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);

          a.href = url;
          a.download = `${category.title}_sample.csv`;
          a.click();
          window.URL.revokeObjectURL(url);
          a.remove();

          this.sampling = false;
        }
      }));
    }
  }

  isValidData(): boolean {
    if (!this.rowData || !this.rowData.length) {
      return false;
    }
    return this.rowData.some((dt: any) => dt.validate_status === 'READY')
  }
}
