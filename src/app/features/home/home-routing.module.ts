import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthenticateGuard } from 'src/app/shared/guards/authenticate.guard';
import { CanDeactivateGuard } from 'src/app/shared/guards/can-deactivate.guard';
import { CategoryResolver } from 'src/app/shared/resolvers/category.resolver';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AboutUsComponent } from './pages/about-us/about-us.component';
import { BulkCreateComponent } from './pages/bulk-create/bulk-create.component';
import { BulkMintComponent } from './pages/bulk-mint/bulk-mint.component';
import { EcosystemComponent } from './pages/ecosystem/ecosystem.component';
import { IndexComponent } from './pages/index/index.component';
import { MintNftComponent } from './pages/mint-nft/mint-nft.component';

const routes: Routes = [
  { path: '', component: IndexComponent },
  { path: 'create', component: EcosystemComponent, canDeactivate: [CanDeactivateGuard], canActivate: [AuthenticateGuard] },
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
  { path: 'bulk-create', component: BulkCreateComponent, canDeactivate: [CanDeactivateGuard], canActivate: [AuthenticateGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthenticateGuard] },
  { path: 'about-us', component: AboutUsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
