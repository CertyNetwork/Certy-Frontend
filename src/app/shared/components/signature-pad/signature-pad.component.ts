import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SignaturePad } from 'angular2-signaturepad';
import { Subject } from 'rxjs';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-signature-pad',
  templateUrl: './signature-pad.component.html',
  styleUrls: ['./signature-pad.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: SignaturePadComponent,
      multi: true
    }
  ]
})
export class SignaturePadComponent implements ControlValueAccessor, AfterViewInit {
  @ViewChild('signaturePad') signaturePad: SignaturePad;
  signaturePadOptions: Object;
  onChange!: Function;
  signatureImage: string = '';
  destroy$ = new Subject<void>();

  drawComplete(event: any) {
    const base64Data = this.signaturePad.toDataURL();
    this.signatureImage = base64Data;
    this.onChange(this.signatureImage);
  }
  
  onClear(event: any) {
    this.signaturePad.clear();
    this.signatureImage = '';
    this.onChange(this.signatureImage);
  }

  constructor(
    private themeService: ThemeService
  ) {
    this.signaturePadOptions = { 
      'minWidth': 1,
      'canvasWidth': 300,
      'canvasHeight': 300,
      'backgroundColor': '#feff80',
      "penColor": "#000"
    };
  }

  ngAfterViewInit(): void {
    if (this.signaturePad) {
      this.signaturePad.fromDataURL(this.signatureImage, this.signaturePadOptions);
    }
  }

  writeValue( value: string ) {
    // clear file input
    if (this.signaturePad) {
      this.signaturePad.fromDataURL(value, this.signaturePadOptions);
    }
    
    this.signatureImage = value;
  }

  registerOnChange( fn: Function ) {
    this.onChange = fn;
  }

  registerOnTouched( fn: Function ) {
  }
}
