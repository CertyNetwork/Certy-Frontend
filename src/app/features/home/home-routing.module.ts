import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthenticateGuard } from 'src/app/shared/guards/authenticate.guard';
import { CanDeactivateGuard } from 'src/app/shared/guards/can-deactivate.guard';
import { CategoryGuard } from 'src/app/shared/guards/category.guard';
import { CategoryResolver } from 'src/app/shared/resolvers/category.resolver';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { BulkMintComponent } from './pages/bulk-mint/bulk-mint.component';
import { CategoriesComponent } from './pages/categories/categories.component';
import { IndexComponent } from './pages/index/index.component';
import { MintNftComponent } from './pages/mint-nft/mint-nft.component';
import { NewCategoryComponent } from './pages/new-category/new-category.component';
import { WorkingComponent } from './pages/working/working.component';
import { IndexGuard } from 'src/app/shared/guards/index.guard';

const routes: Routes = [
  { path: '', component: IndexComponent, canActivate: [IndexGuard] },
  { path: 'working', component: WorkingComponent, canActivate: [IndexGuard] },
  {
    path: 'create',
    component: MintNftComponent,
    canDeactivate: [CanDeactivateGuard],
    canActivate: [AuthenticateGuard, CategoryGuard] },
  {
    path: 'create/:categoryId',
    component: MintNftComponent,
    canDeactivate: [CanDeactivateGuard],
    canActivate: [AuthenticateGuard],
    resolve: {
      category: CategoryResolver
    }
  },
  {
    path: 'bulk-create/:categoryId',
    component: BulkMintComponent,
    canDeactivate: [CanDeactivateGuard],
    canActivate: [AuthenticateGuard],
    resolve: {
      category: CategoryResolver
    }
  },
  {
    path: 'bulk-create',
    component: BulkMintComponent,
    canDeactivate: [CanDeactivateGuard],
    canActivate: [AuthenticateGuard, CategoryGuard]
  },
  { path: 'categories', component: CategoriesComponent, canActivate: [AuthenticateGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthenticateGuard] },
  { path: 'category-new', component: NewCategoryComponent, canActivate: [AuthenticateGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
