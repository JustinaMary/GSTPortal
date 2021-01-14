import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { AccountsComponent } from './accounts.component';
// import { LoginComponent } from './login/login.component';
import { AdminLoginComponent } from './adminlogin/adminlogin.component';
import { ForgotpasswordComponent } from './forgotpassword/forgotpassword.component';
import { ResetpasswordComponent } from './resetpassword/resetpassword.component';
import { LogoutComponent } from './logout/logout.component';



const routes: Routes = [{
  path: '',
  component: AccountsComponent,
  children: [
    {
      path: 'forgotpassword',
      component: ForgotpasswordComponent,
    },
    {
      path: 'resetpassword/:userId/:code',
      component: ResetpasswordComponent,
    },
    {
      path: 'adminlogin',
      component: AdminLoginComponent,
    },
    {
      path: '',
      redirectTo: '',
      pathMatch: 'full',
    },
    {
      path: 'logout',
      component: LogoutComponent,
    },
    // { // jinal uncomment when u create pagenotfound component
    //   path: '**',
    //   redirectTo: 'notfound',
    // },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountsRoutingModule {
}
