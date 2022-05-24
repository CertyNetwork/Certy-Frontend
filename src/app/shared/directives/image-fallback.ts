import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[imgFallback]'
})
export class ImageFallbackDirective {
  constructor(private el: ElementRef) {}

  @HostListener('error')
  onFormSubmit() {
    const el = this.el.nativeElement as HTMLImageElement;
    if (!el) {
      
    }

    el.src = '/assets/images/empty.jpeg';
  }
}