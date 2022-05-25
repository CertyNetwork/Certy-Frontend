import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { Papa } from 'ngx-papaparse';
import {
  catchError, defer, finalize, forkJoin, from, fromEvent, ignoreElements,
  map, merge, mergeMap, Observable, of, Subject, Subscription, tap
} from 'rxjs';
import {
  debounceTime,
  switchMap,
} from 'rxjs/operators';
import { ContractService } from 'src/app/shared/services/certify.contract.service';
import { Category } from 'src/app/shared/models/category';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-bulk-mint',
  templateUrl: './bulk-mint.component.html',
  styleUrls: ['./bulk-mint.component.scss']
})
export class BulkMintComponent implements OnInit {
  category$: Observable<Category>;
  sampling = false;
  step: 'select_file' | 'preview' | 'processing' = 'select_file';
  files: File[] = [];
  rowData: any[] = [];
  fileLoading: boolean = false;
  fileProcessing: boolean = false;
  cols: any[] = [];
  private subs = new Subscription();

  constructor(
    private contractSvc: ContractService,
    private confirmationService: ConfirmationService,
    private papa: Papa,
    private activeRoute: ActivatedRoute
  ) {
    this.category$ = this.activeRoute.data.pipe(
      map(data => data['category'] as Category)
    );
  }

  ngOnInit(): void {
    //
  }

  async onSubmit () {
    // const coverImage = this.files[0];
    // const { data: fileUploadResult, error: fileError } = await this.contractSvc.upload(coverImage);

    // if (fileError) {
    //   console.error(fileError);
    //   return;
    // }

    // // setIsMinting(false);
    // const { uri, hash } = fileUploadResult;
    // const { basicInfo, additionalInfo } = this.certForm.value;
    // this.contractSvc.mintCertificate({
    //   title: basicInfo.title,
    //   media: uri,
    //   description: basicInfo.description,
    //   issued_at: Date.now(),
    //   transferred: false,
    //   properties: {
    //     certification_authority_name: additionalInfo?.certification_authority_name,
    //     major: additionalInfo?.major,
    //     degree_title: additionalInfo?.degree_title,
    //     degree_classification: additionalInfo?.degree_classification,
    //     hash: hash,
    //   }
    // }).then((result) => {
    //   console.log(result);
    // }).catch(e => console.log(e));
  }

  onSelect(event: any) {
    this.files = event.addedFiles;
  }
  
  onRemove(event: any) {
    console.log(event);
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
          }
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
        this.rowData = result.data;
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

  process() {
    this.fileProcessing = true;
    const arrayOfObservables = this.rowData.map(data => {
      return from(this.contractSvc.mintCertificate({
        title: data.title,
        media: 'uri',
        description: data.description,
        issued_at: Date.now(),
        reference: '',
      }));
    });

    const result = this.processBulkMint(arrayOfObservables);
    result.pipe(
      mergeMap(([finalResult, progress]) => merge(
        progress.pipe(
          tap((value) => {
            console.log(`${value} completed`);
            if (value === 100) {
              this.fileProcessing = false;
            }
          }),
          ignoreElements()
        ),
        finalResult
      ))
    ).subscribe(() => {
      
    });
  }

  private processBulkMint(arrayOfObservables: Observable<any>[]) {
    return defer(() => {
      let counter = 0;
      const percent$ = new Subject();
  
      const modifiedObservablesList = arrayOfObservables.map(
        (item, index) => {
          this.rowData[index].processing_status = 'processing';
          this.rowData = [...this.rowData];
          return item.pipe(
            finalize(() => {
              const percentValue = ++counter * 100 /  arrayOfObservables.length;
              percent$.next(percentValue);
            }),
            tap(() => {
              this.rowData[index].processing_status = 'completed';
              this.rowData = [...this.rowData];
            }),
            catchError(() => {
              this.rowData[index].processing_status = 'error';
              this.rowData = [...this.rowData];
              return of(false);
            }),
          )
        }
      );
    
      const finalResult$ = forkJoin(modifiedObservablesList).pipe(
        tap(() => {
          percent$.next(100);
          percent$.complete();
        }
      ));
      
      return of([finalResult$, percent$.asObservable()]);
    });
  }

  @ViewChild('downloadSampleButton') set manageBankButton(content: ElementRef) {
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
          }, {});
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
}
