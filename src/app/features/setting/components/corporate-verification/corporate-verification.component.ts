import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-corporate-verification',
  templateUrl: './corporate-verification.component.html',
  styleUrls: ['./corporate-verification.component.scss']
})
export class CorporateVerificationComponent implements OnInit {
  infoForm: FormGroup;
  step = 'info';

  constructor(
    private fb: FormBuilder,
    private dialogRef: DynamicDialogRef
  ) {
    this.infoForm = fb.group({
      email: [null, [Validators.required, Validators.email]],
      contactName: [null, [Validators.required]],
      organizationName: [null, [Validators.required]],
      address: [null, [Validators.required]],
      phoneNumber: [null, [Validators.required]],
    });
  }

  ngOnInit(): void {
  }

  submitInfo() {
    this.dialogRef.close(true);
  }

}
