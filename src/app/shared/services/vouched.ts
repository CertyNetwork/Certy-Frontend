import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VouchedService implements OnDestroy {
  private scriptId;
  private loadedSubject = new BehaviorSubject(false);
  public loaded$ = this.loadedSubject.asObservable();

  public constructor(
    @Inject(DOCUMENT) private document: Document,
  ) {
    this.scriptId = +(new Date());
    this.init();
  }

  public startVerification() {
    const isLoaded = this.loadedSubject.value;
    if (!isLoaded) {
      return;
    }
    const vouched = (window as any).Vouched({
      appId: environment.VOUCHED_PUBLIC_KEY,
      callbackURL: 'https://webhook.site/5cb92794-e8c6-49c9-b670-bd27a86a5b63',
      verification: {
        firstName: 'Gladys',
        lastName: 'West',
        email: 'test@test.id',
        phone: '000-111-2222'
      },
      
      // mobile handoff
      crossDevice: true,
      crossDeviceQRCode: true,
      crossDeviceSMS: true,
      onInit: ({token, job}: any) => {
        console.log('initialization');
      },
    
      // called when the verification is completed.
      onDone: (job: any) => {
        // token used to query jobs
        console.log("Scanning complete", { token: job.token });
    
        // An alternative way to update your system based on the 
        // results of the job. Your backend could perform the following:
        // 1. query jobs with the token
        // 2. store relevant job information such as the id and 
        //    success property into the user's profile
        fetch(`/yourapi/idv?job_token=${job.token}`);
    
    
        // Redirect to the next page based on the job success
        if( job.result.success){
          window.location.replace("https://website.com/success/");
        }else{
          window.location.replace("https://website.com/failed/");
        }
      },
      
      // theme
      theme: {
        name: 'avant',
      },
    });
    vouched.mount("#vouched_element");
  }

  private init() {
    const script = this.document.createElement('script');
    script.innerHTML = '';
    script.src = 'https://static.vouched.id/widget/vouched-2.0.0.js';
    script.id = `vouched-${this.scriptId}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      this.loadedSubject.next(true);
    }
    script.onerror = () => {
      this.loadedSubject.next(false);
    };
    this.document.head.appendChild(script);
  }

  ngOnDestroy(): void {
    const script = this.document.getElementById(`vouched-${this.scriptId}`);
    if (script) {
      script.remove();
    }
    this.loadedSubject.unsubscribe();
  }
}