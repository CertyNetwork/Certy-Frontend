import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { IndexComponent } from './pages/index/index.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { CommunityComponent } from './pages/community/community.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { BulkMintComponent } from './pages/bulk-mint/bulk-mint.component';
import { AddCategoryComponent } from './components/add-category/add-category.component';
import { MintNftComponent } from './pages/mint-nft/mint-nft.component';
import { NewCategoryComponent } from './pages/new-category/new-category.component';
import { WorkingComponent } from './pages/working/working.component';
import { CategoriesComponent } from './pages/categories/categories.component';
import { CategoryDetailsComponent } from './pages/category-details/category-details.component';


@NgModule({
  declarations: [
    IndexComponent,
    CommunityComponent,
    DashboardComponent,
    CategoriesComponent,
    BulkMintComponent,
    AddCategoryComponent,
    MintNftComponent,
    NewCategoryComponent,
    WorkingComponent,
    CategoryDetailsComponent,
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    SharedModule
  ]
})
export class HomeModule { }
