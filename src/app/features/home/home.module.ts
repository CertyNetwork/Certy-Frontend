import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { IndexComponent } from './pages/index/index.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { EcosystemComponent } from './pages/ecosystem/ecosystem.component';
import { CommunityComponent } from './pages/community/community.component';
import { AboutUsComponent } from './pages/about-us/about-us.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { BulkMintComponent } from './pages/bulk-mint/bulk-mint.component';
import { AddCategoryComponent } from './components/add-category/add-category.component';
import { MintNftComponent } from './pages/mint-nft/mint-nft.component';
import { BulkCreateComponent } from './pages/bulk-create/bulk-create.component';


@NgModule({
  declarations: [
    IndexComponent,
    EcosystemComponent,
    CommunityComponent,
    AboutUsComponent,
    DashboardComponent,
    BulkMintComponent,
    AddCategoryComponent,
    MintNftComponent,
    BulkCreateComponent,
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    SharedModule
  ]
})
export class HomeModule { }
