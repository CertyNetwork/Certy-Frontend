import { Component, OnInit } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { VouchedService } from 'src/app/shared/services/vouched';
import { CorporateVerificationComponent } from '../corporate-verification/corporate-verification.component';

@Component({
  selector: 'app-kyc',
  templateUrl: './kyc.component.html',
  styleUrls: ['./kyc.component.scss']
})
export class KycComponent implements OnInit {
  displayCorporateConfirm = false;
  canKyc$ = this.vouchedService.loaded$;
  
  constructor(
    private dialogSvc: DialogService,
    private vouchedService: VouchedService
  ) { }

  ngOnInit(): void {
  }

  requestCorporateInfo() {
    this.dialogSvc.open(CorporateVerificationComponent, {
      header: 'Organization Verification',
      width: '500px',
    }).onClose.subscribe((result) => {
      if (result) {
        this.displayCorporateConfirm = true;
      }
    });
  }

  startIndividualKyc() {
    this.vouchedService.startVerification();
  }
}
