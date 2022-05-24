import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BasicInfoComponent } from './components/basic-info/basic-info.component';
import { KycComponent } from './components/kyc/kyc.component';
import { IndexComponent } from './pages/index/index.component';
import { SettingRoutingModule } from './setting-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';



@NgModule({
  declarations: [
    BasicInfoComponent,
    KycComponent,
    IndexComponent
  ],
  imports: [
    CommonModule,
    SettingRoutingModule,
    SharedModule
  ]
})
export class SettingModule { }
