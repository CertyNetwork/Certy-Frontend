import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-search-box',
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.scss']
})
export class SearchBoxComponent implements OnInit, OnDestroy {
  searchInputElement: ElementRef;
  sub = new Subscription();
  showClearIcon: boolean;
  @Input() placeholder: string = '';
  @Output() onSearch = new EventEmitter();

  constructor() { }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  ngOnInit(): void {
    //
  }

  @ViewChild('searchInput') set searchInput(content: ElementRef) {
    if (content) {
      this.searchInputElement = content;
      this.sub.add(fromEvent(content.nativeElement, 'keyup').pipe(
        debounceTime(150),
        distinctUntilChanged(),
      ).subscribe((event: any) => {
        const val = event.srcElement.value;
        this.onSearch.emit(val);
        if (val) {
          this.showClearIcon = true;
        } else {
          this.showClearIcon = false;
        }
      }));
    }
  }

  @ViewChild('clearIcon') set clearIcon(content: ElementRef) {
    if (content) {
      this.sub.add(fromEvent(content.nativeElement, 'click').subscribe((event: any) => {
        if (this.searchInputElement) {
          this.searchInputElement.nativeElement.value = '';
          this.onSearch.emit('');
          this.showClearIcon = false;
        }
      }));
    }
  }
}
