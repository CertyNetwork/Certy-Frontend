import { Component, ElementRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: FileUploadComponent,
      multi: true
    }
  ]
})
export class FileUploadComponent implements ControlValueAccessor {
  onChange!: Function;
  files: File[] = [];
  @Input() label: string = 'Click or drop images';
  @Input() accept: string = '*';

  onSelect(event: any) {
    this.files.push(...event.addedFiles);
    this.onChange(this.files);
  }
  
  onRemove(event: any) {
    this.files.splice(this.files.indexOf(event), 1);
  }

  constructor( private host: ElementRef<HTMLInputElement> ) {
  }

  writeValue(value: File[]) {
    if (value && value.length) {
      this.files = value;
    } else {
      this.files = [];
    }
  }

  registerOnChange( fn: Function ) {
    this.onChange = fn;
  }

  registerOnTouched( fn: Function ) {
  }

}
