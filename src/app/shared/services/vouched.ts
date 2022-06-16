import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, take } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ThemeService } from './theme.service';

@Injectable({
  providedIn: 'root'
})
export class VouchedService implements OnDestroy {
  private scriptId;
  private statusSubject = new BehaviorSubject('not-ready');
  public status$ = this.statusSubject.asObservable();
  vouched: any;

  public constructor(
    @Inject(DOCUMENT) private document: Document,
    private http: HttpClient,
    private themeService: ThemeService
  ) {
    this.scriptId = +(new Date());
    this.init();
  }

  public startVerification(session?: string) {
    const status = this.statusSubject.value;
    if (status !== 'ready') {
      return;
    }

    const theme = this.themeService.getCurrentTheme();

    this.vouched = (window as any).Vouched({
      appId: environment.VOUCHED_PUBLIC_KEY,
      callbackURL: `${environment.apiUrl}/webhook/vouched-id`,
      ...(session ? { token: session } : null),
      sandbox: environment.VOUCHED_SANDBOX_MODE,

      type: 'idv',
      id: 'camera',
      face: 'camera',
      
      // mobile handoff settings
      crossDevice: true,
      crossDeviceQRCode: true,
      crossDeviceSMS: false,
      disableCssBaseline: true,

      onInit: ({token, job}: any) => {
        if (!session && token && job.id) {
          this.http.post(`${environment.apiUrl}/kyc/verification/start`, {
            ref: job.id,
            token,
          }).pipe(
            take(1),
          ).subscribe((res) => {
          });
        }
      },
    
      // called when the verification is completed.
      onDone: (job: any) => {
        this.http.post(`${environment.apiUrl}/kyc/verification/finish`, {
          jobId: job.id,
          jobToken: job.token,
        }).pipe(
          take(1),
        ).subscribe((res) => {
          console.log(res);
        });
      },
      
      // theme
      theme: {
        name: 'avant',
        handoffLinkColor: '#2A85FF',
        bgColor: theme === 'light' ? '##ffffff' : '#1A1D1F',
      },
    });

    this.vouched.mount("#vouched_element");
  }

  private init() {
    const script = this.document.createElement('script');
    script.innerHTML = '';
    script.src = 'https://static.vouched.id/widget/vouched-2.0.0.js';
    script.id = `vouched-${this.scriptId}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      this.statusSubject.next('ready');
    }
    script.onerror = () => {
      this.statusSubject.next('error');
    };
    this.document.head.appendChild(script);
  }

  ngOnDestroy(): void {
    if (this.vouched) {
      this.vouched.unmount("#vouched_element");
    }
    
    const script = this.document.getElementById(`vouched-${this.scriptId}`);
    if (script) {
      script.remove();
    }
    this.statusSubject.unsubscribe();
  }

  getVerificationStatus() {
    return this.http.get(`${environment.apiUrl}/kyc/verification/status`).pipe(
      take(1),
    );
  }
}