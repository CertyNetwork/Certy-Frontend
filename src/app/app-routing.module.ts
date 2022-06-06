import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { AuthenticateGuard } from './shared/guards/authenticate.guard';

const routes: Routes = [
  { path: '', loadChildren: () => import('./features/home/home.module').then(m => m.HomeModule) },
  { path: 'setting', loadChildren: () => import('./features/setting/setting.module').then(m => m.SettingModule), canLoad: [AuthenticateGuard] },
  {
    path: "**", component: PageNotFoundComponent
  }
];


@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
