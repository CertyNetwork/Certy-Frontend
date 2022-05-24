import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Papa } from 'ngx-papaparse';
import { ConfirmationService } from 'primeng/api';
import { Observable, Subscription, map, from, mergeMap, merge, tap, ignoreElements, defer, Subject, finalize, catchError, of, forkJoin } from 'rxjs';
import { Category } from 'src/app/shared/models/category';
import { ContractService } from 'src/app/shared/services/certify.contract.service';

@Component({
  selector: 'app-bulk-create',
  templateUrl: './bulk-create.component.html',
  styleUrls: ['./bulk-create.component.scss']
})
export class BulkCreateComponent implements OnInit {
  step: 'select_file' | 'preview' | 'processing' = 'select_file';
  files: File[] = [];
  rowData: any[] = [];
  fileLoading: boolean = false;
  fileProcessing: boolean = false;
  private subs = new Subscription();

  constructor(
    private contractSvc: ContractService,
    private confirmationService: ConfirmationService,
    private papa: Papa,
    private activeRoute: ActivatedRoute
  ) {
    //
  }

  ngOnInit(): void {
    this.contractSvc.getAllCerts().then((result) => {
      console.log(result);
    }).catch(e => console.log(e))
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
        this.rowData = result.data;
      },
      error: () => {
        this.fileLoading = false;
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
        transferred: false,
        properties: {
          certification_authority_name: data.certification_authority_name,
          major: data.major,
          degree_title: data.degree_title,
          degree_classification: data.degree_classification,
          hash: data,
        }
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

  generateSampleCsv() {

  }
}
