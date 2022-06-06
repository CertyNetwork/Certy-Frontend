import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BasicInfoComponent } from './components/basic-info/basic-info.component';
import { KycComponent } from './components/kyc/kyc.component';
import { IndexComponent } from './pages/index/index.component';
import { SettingRoutingModule } from './setting-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { CorporateVerificationComponent } from './components/corporate-verification/corporate-verification.component';



@NgModule({
  declarations: [
    BasicInfoComponent,
    KycComponent,
    IndexComponent,
    CorporateVerificationComponent
  ],
  imports: [
    CommonModule,
    SettingRoutingModule,
    SharedModule
  ]
})
export class SettingModule { }
