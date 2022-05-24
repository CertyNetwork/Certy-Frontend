import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-theme-switcher',
  templateUrl: './theme-switcher.component.html',
  styleUrls: ['./theme-switcher.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeSwitcherComponent implements OnInit {
  theme$ = this.themeService.theme$;
  constructor(
    private themeService: ThemeService
  ) {
    //
  }

  ngOnInit(): void {}

  switchMode(theme: string) {
    this.themeService.changeTheme(theme);
  }
}
