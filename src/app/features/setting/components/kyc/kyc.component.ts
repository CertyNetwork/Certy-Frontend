import { Component, OnInit } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { CorporateVerificationComponent } from '../corporate-verification/corporate-verification.component';
import { IndividualVerificationComponent } from '../individual-verification/individual-verification.component';

@Component({
  selector: 'app-kyc',
  templateUrl: './kyc.component.html',
  styleUrls: ['./kyc.component.scss']
})
export class KycComponent implements OnInit {
  displayCorporateConfirm = false;
  
  constructor(
    private dialogSvc: DialogService,
  ) { }

  ngOnInit(): void {
  }

  requestCorporateInfo() {
    this.dialogSvc.open(CorporateVerificationComponent, {
      header: 'Organization Verification',
      width: '500px',
    }).onClose.subscribe((result) => {
      if (result) {
        // this.displayCorporateConfirm = true;
        const { organizationName, email, contactName, address, phoneNumber } = result;
        const body = encodeURIComponent(`Hi, we would like to submit institution info as below:

        Organization Name: ${organizationName}
        Contact Email: ${email}
        Contact Name: ${contactName}
        Address: ${address}
        Phone Number: ${phoneNumber}
        
        Thanks for your consideration!`);
        window.open(`https://mail.google.com/mail/?view=cm&to=ceo@certy.network&su=Institution%20Kyc%20Submission&body=${body}`);
      }
    });
  }

  startIndividualKyc() {
    this.dialogSvc.open(IndividualVerificationComponent, {
      header: 'Individual Verification',
      style: {
        transform: 'none',
        'width': '600px'
      },
    });
  }
}
