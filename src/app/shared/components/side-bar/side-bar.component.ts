import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss']
})
export class SideBarComponent implements OnInit {
  isMenu: boolean = false;
  isMenuBtn() {
    this.isMenu = !this.isMenu;
  }
  isSearch: boolean = false;
  
  theme$ = this.themeService.theme$;

  constructor(
    private themeService: ThemeService
  ) {
    //
  }

  ngOnInit(): void {
  }

  switchMode(theme: string) {
    this.themeService.changeTheme(theme);
  }

}
