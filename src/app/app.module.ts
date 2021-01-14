/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpClientModule, HttpClientXsrfModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CoreModule } from './@core/core.module';
import { ThemeModule } from './@theme/theme.module';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
// import { DocumentModule } from './document/document.module';
import { ReactiveFormsModule } from '@angular/forms';
// import { AirlineModule } from './airline/airline.module';
import { MasterPageModule } from './masterpage/masterpage.module';
import { AccountsModule } from './accounts/accounts.module';
// import { CustomerModule } from './customer/customer.module';
// import { CommonPagesModule } from './commonpages/commonpages.module';
// import { MenuModule } from './menu/menu.module';
import { AccountsService } from './services/accounts.service';
import { HomeModule } from './home/home.module';
import { NotFoundModule } from './notfoundpage/notfound.module';
import { ErrorInterceptor } from './services/error.interceptor';
import { JwtInterceptor } from './services/jwt.interceptor';
import { PreviousRouteService } from './services/back.route.service';

import {
  NbChatModule,
  NbDatepickerModule,
  NbDialogModule,
  NbMenuModule,
  NbSidebarModule,
  NbToastrModule,
  NbWindowModule,
  NbIconModule,
} from '@nebular/theme';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    NbIconModule,
    NbSidebarModule.forRoot(),
    NbMenuModule.forRoot(),
    NbDatepickerModule.forRoot(),
    NbDialogModule.forRoot(),
    NbWindowModule.forRoot(),
    NbToastrModule.forRoot(),
    NbChatModule.forRoot({
      messageGoogleMapKey: 'AIzaSyA_wNuCzia92MAmdLRzmqitRGvCF7wCZPY',
    }),
    CoreModule.forRoot(),
    ThemeModule.forRoot(),
    // DocumentModule,
    ReactiveFormsModule,
    // AirlineModule,
    MasterPageModule,
    AccountsModule,
    HomeModule,
    NotFoundModule,
    // CommonPagesModule,
    // CustomerModule,
    // MenuModule,
    HttpClientXsrfModule.withOptions({
      cookieName: 'XSRF-TOKEN',
      headerName: 'X-XSRF-TOKEN',
    }),
  ],
  providers: [
    AccountsService,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    PreviousRouteService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
