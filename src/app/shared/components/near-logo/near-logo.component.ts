import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-near-logo',
  templateUrl: './near-logo.component.html',
  styleUrls: ['./near-logo.component.scss']
})
export class NearLogoComponent implements OnInit {
  theme$ = this.themeService.theme$;
  
  constructor(
    private themeService: ThemeService
  ) { }

  ngOnInit(): void {
  }

}
