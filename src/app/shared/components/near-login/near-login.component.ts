import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-near-login',
  templateUrl: './near-login.component.html',
  styleUrls: ['./near-login.component.scss']
})
export class NearLoginComponent implements OnInit {

  constructor(
    public authService: AuthService
  ) { }

  ngOnInit(): void {
  }

}
