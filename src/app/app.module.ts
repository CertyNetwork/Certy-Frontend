import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RecipeListComponent } from './components/recipe-list/recipe-list.component';
import { RecipeItemComponent } from './components/recipe-item/recipe-item.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { DataService } from './services/DataService';
import { SharedModule } from './shared/shared.module';
import { CanDeactivateGuard } from './shared/guards/can-deactivate.guard';
import { AuthenticateGuard } from './shared/guards/authenticate.guard';
import { THEMES } from './constants/theme';

@NgModule({
  declarations: [
    AppComponent,
    RecipeListComponent,
    RecipeItemComponent,
    PageNotFoundComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientInMemoryWebApiModule.forRoot(DataService, {
      delay: 0,
    }),
    HttpClientModule,
    SharedModule,
  ],
  providers: [
    {
      provide: THEMES,
      useValue: ['light', 'dark'],
    },
    CanDeactivateGuard,
    AuthenticateGuard,
    ConfirmationService,
    DialogService,
    MessageService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
