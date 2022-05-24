import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CookieService } from './cookie.service';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeSubject = new BehaviorSubject<string>(this.getCurrentTheme());
  theme$ = this.themeSubject.asObservable();

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private cookieService: CookieService,
  ) {
    const currentTheme = this.themeSubject.getValue() || "light";
    this.document.querySelector('body')?.classList.add(currentTheme);
    const themeLink = this.document.getElementById('primeng-theme') as HTMLLinkElement;
    if (themeLink) {
      themeLink.href = `lara-${currentTheme}.css`;
    }
  }

  public getCurrentTheme(): string {
    const currentTheme = this.cookieService.get("current_theme") || "light";
    return currentTheme;
  }

  public changeTheme(theme: string) {
    const currentTheme = this.themeSubject.getValue();
    if (currentTheme !== theme) {
      this.cookieService.set('current_theme', theme);
      this.themeSubject.next(theme);
      this.document.querySelector('body')?.classList.remove(currentTheme);
      this.document.querySelector('body')?.classList.add(theme);

      // change third-party theme
      const themeLink = this.document.getElementById('primeng-theme') as HTMLLinkElement;
      if (themeLink) {
        themeLink.href = `lara-${theme}.css`;
      }
    }
  }
}
