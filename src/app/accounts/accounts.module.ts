import { NgModule } from '@angular/core';
import { NbMenuModule, NbFormFieldModule, NbIconModule, NbInputModule } from '@nebular/theme';

import { ThemeModule } from '../@theme/theme.module';
import { LoginComponent } from './login/login.component';
import { AdminLoginComponent } from './adminlogin/adminlogin.component';
import { ForgotpasswordComponent } from './forgotpassword/forgotpassword.component';
import { ResetpasswordComponent } from './resetpassword/resetpassword.component';
import { AccountsComponent } from './accounts.component';
// import { DashboardModule } from './dashboard/dashboard.module';
// import { ECommerceModule } from './e-commerce/e-commerce.module';
import { AccountsRoutingModule } from './accounts-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LogoutComponent } from './logout/logout.component';

// import { MiscellaneousModule } from './miscellaneous/miscellaneous.module';

@NgModule({
  imports: [
    AccountsRoutingModule,
    ThemeModule,
    NbMenuModule,
    /*DashboardModule,
    ECommerceModule,
    MiscellaneousModule,*/
    FormsModule,
    ReactiveFormsModule,
    NbInputModule,
    NbFormFieldModule,
    NbIconModule,
  ],
  declarations: [
    AccountsComponent,
    LoginComponent,
    AdminLoginComponent,
    ForgotpasswordComponent,
    ResetpasswordComponent,
    LogoutComponent,
  ],
})
export class AccountsModule {
}
