import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { catchError, filter, map, Observable, of, Subject, switchMap, take, takeUntil } from 'rxjs';
import { VouchedService } from 'src/app/shared/services/vouched';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-individual-verification',
  templateUrl: './individual-verification.component.html',
  styleUrls: ['./individual-verification.component.scss']
})
export class IndividualVerificationComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  status$ = this.vouchedService.status$;
  session: Observable<any>;

  constructor(
    private vouchedService: VouchedService,
    private dialogRef: DynamicDialogRef,
    private http: HttpClient,
    private messageService: MessageService
  ) {
    this.session = this.http.get(`${environment.apiUrl}/kyc/verification/latest`).pipe(
      take(1),
      catchError((e) => {
        this.messageService.add({
          severity: 'error',
          detail: e.error.message
        });
        this.dialogRef.close();
        return of(null);
      }),
      map(({data}: any) => data.session)
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @ViewChild('vouched_element') set vouchedElement(content: ElementRef) {
    if (content) {
      this.vouchedService.status$.pipe(
        filter(status => status === 'ready'),
        takeUntil(this.destroy$),
        switchMap(() => this.session)
      ).subscribe((session) => {
        this.vouchedService.startVerification(session);
      });
    }
  }

  ngOnInit(): void {
    
  }
}
