import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[appTitle]'
})
export class TitleDirective {
    constructor(private el: ElementRef) {
       (this.el.nativeElement as HTMLElement)?.classList.add('app-title');
    }
}