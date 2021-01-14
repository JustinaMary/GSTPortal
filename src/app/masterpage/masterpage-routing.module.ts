import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MasterPageComponent } from './masterpage.component';

import { ListComponent } from './airline/airline-master/list.component';
import { CreateComponent } from './airline/airline-master/create.component';
import { EditComponent } from './airline/airline-master/edit.component';
import { StateCreateComponent } from './airline/airline-states/create.component';
import { StateEditComponent } from './airline/airline-states/edit.component';
import { StateListComponent } from './airline/airline-states/list.component';
import { UserListComponent } from './airline/airline-users/list.component';
import { UserCreateComponent } from './airline/airline-users/create.component';
import { UserEditComponent } from './airline/airline-users/edit.component';
import { TransTypeCreateComponent } from './airline/transaction-type/create.component';
import { TransTypeEditComponent } from './airline/transaction-type/edit.component';
import { TransTypeListComponent } from './airline/transaction-type/list.component';
import { AuthGuard } from '../../app/services/auth-guard.service';

// customer start
import { CCreateComponent } from './customer/customer-master/create.component';
// import { CreateNonLoginComponent } from './customer/customer-master/createnonlogin.component';
import { DetailComponent } from './customer/customer-master/detail.component';
import { ProfileComponent } from './customer/customer-master/profile.component';
import { CListComponent } from './customer/customer-master/list.component';
import { CStateCreateComponent } from './customer/customer-states/create.component';
import { CStateEditComponent } from './customer/customer-states/edit.component';
import { CStateListComponent } from './customer/customer-states/list.component';
import { CUserListComponent } from './customer/customer-users/list.component';
import { CUserCreateComponent } from './customer/customer-users/create.component';
import { CUserEditComponent } from './customer/customer-users/edit.component';

import { RaiseRequestCreateComponent } from './customer/raise-request/create.component';
import { RaiseRequestEditComponent } from './customer/raise-request/edit.component';
import { RaiseRequestListComponent } from './customer/raise-request/list.component';
import { RaiseRequestDetailComponent } from './customer/raise-request/detail.component';
import { B2CGstRequestListComponent } from './customer/b2c-gst-request/list.component';

// menu
import { MenuMasterComponent } from './menu/menumaster.component';
import { MenuActionComponent } from './menu/menuaction.component';

// commonpages
import { ManagePasswordComponent } from '../masterpage/commonpages/managepassword.component';
import { ResetAdminPasswordComponent } from '../masterpage/commonpages/resetadminpassword.component';
import { NotificationsComponent } from '../masterpage/commonpages/notifications.component';
import { DashboardComponent } from '../masterpage/commonpages/dashboard.component';
import { UnauthorizedComponent } from '../masterpage/commonpages/unauthorized.component';
import { MyProfileComponent } from '../masterpage/commonpages/myprofile.component';
import { UsermanualComponent } from '../masterpage/commonpages/usermanual.component';
import { FaqComponent } from '../masterpage/commonpages/faq.component';


// email config
import { EmailConfigComponent } from '../masterpage/emailconfig/emailconfig.component';

// document
import { UploadDocComponent } from '../masterpage/document/upload/uploaddoc.component';
import { DownloadDocComponent } from '../masterpage/document/download/downloaddoc.component';

const routes: Routes = [{
  path: '',
  component: MasterPageComponent,
  children: [
    {
      path: 'airlineList',
      component: ListComponent,
      canActivate: [AuthGuard],
    },
    {
      path: 'airlineCreate',
      component: CreateComponent,
      canActivate: [AuthGuard],
    },
    {
      path: 'airlineEdit/:airlineId',
      component: EditComponent,
      canActivate: [AuthGuard],
    },
    {
      path: 'airlineStateList',
      component: StateListComponent,
      canActivate: [AuthGuard],
    },
    {
      path: 'airlineStateCreate',
      component: StateCreateComponent,
      canActivate: [AuthGuard],
    },
    {
      path: 'airlineStateEdit/:airStId',
      component: StateEditComponent,
      canActivate: [AuthGuard],
    },
    {
      path: 'airlineUserList',
      component: UserListComponent,
      canActivate: [AuthGuard],
    },
    {
      path: 'airlineUserCreate',
      component: UserCreateComponent,
      canActivate: [AuthGuard],
    },
    {
      path: 'airlineUserEdit/:airUserId',
      component: UserEditComponent,
      canActivate: [AuthGuard],
    },
    {
      path: 'transTypeList',
      component: TransTypeListComponent,
      canActivate: [AuthGuard],
    },
    {
      path: 'transTypeCreate',
      component: TransTypeCreateComponent,
      canActivate: [AuthGuard],
    },
    {
      path: 'transTypeEdit/:typeId',
      component: TransTypeEditComponent,
      canActivate: [AuthGuard],
    },
    // customer routing start
    {
      path: 'customerList',
      component: CListComponent,
      canActivate: [AuthGuard],
    },
    {
      path: 'requestCreate',
      component: CCreateComponent,
      canActivate: [AuthGuard],
    },
    // {
    //   path: 'requestCreateNonLogin',
    //   component: CreateNonLoginComponent,
    // },
    {
      path: 'customerRequestDetail/:reqId',
      component: DetailComponent,
      canActivate: [AuthGuard],
    },
    {
      path: 'profile/:reqId',
      component: ProfileComponent,
      canActivate: [AuthGuard],
    },
    {
      path: 'customerStateList',
      component: CStateListComponent,
      canActivate: [AuthGuard],
    },
    {
      path: 'customerStateCreate',
      component: CStateCreateComponent,
      canActivate: [AuthGuard],
    },
    {
      path: 'customerStateEdit/:custStId',
      component: CStateEditComponent,
      canActivate: [AuthGuard],
    },
    {
      path: 'customerUserList',
      component: CUserListComponent,
      canActivate: [AuthGuard],
    },
    {
      path: 'customerUserCreate',
      component: CUserCreateComponent,
      canActivate: [AuthGuard],
    },
    {
      path: 'customerUserEdit/:custUserId',
      component: CUserEditComponent,
      canActivate: [AuthGuard],
    },
    {
      path: 'raiseReqCreate',
      component: RaiseRequestCreateComponent,
      canActivate: [AuthGuard],
    },
    {
      path: 'raiseReqEdit/:rrId',
      component: RaiseRequestEditComponent,
      canActivate: [AuthGuard],
    },
    {
      path: 'raiseReqDetail/:rrId',
      component: RaiseRequestDetailComponent,
      canActivate: [AuthGuard],
    },
    {
      path: 'raiseReqList',
      component: RaiseRequestListComponent,
      canActivate: [AuthGuard],
    },
    {
      path: 'b2cGstReqList',
      component: B2CGstRequestListComponent,
      canActivate: [AuthGuard],
    },
    // menu routing start
    {
      path: 'menuMaster',
      component: MenuMasterComponent,
      canActivate: [AuthGuard],
    },
    {
      path: 'menuAction/:id',
      component: MenuActionComponent,
      canActivate: [AuthGuard],
    },
    // commonpages
    {
      path: 'managepw',
      component: ManagePasswordComponent,
      canActivate: [AuthGuard],
    },
    {
      path: 'resetadminpw',
      component: ResetAdminPasswordComponent,
      canActivate: [AuthGuard],
    },
    {
      path: 'notifications',
      component: NotificationsComponent,
      canActivate: [AuthGuard],
    },
    {
      path: 'dashboard',
      component: DashboardComponent,
      canActivate: [AuthGuard],
    },
    {
      path: 'myprofile',
      component: MyProfileComponent,
      canActivate: [AuthGuard],
    },
    {
      path: 'emailconfiguration',
      component: EmailConfigComponent,
      canActivate: [AuthGuard],
    },
    {
      path: 'usermanual',
      component: UsermanualComponent,
      // canActivate: [AuthGuard],
    },
    {
      path: 'faq',
      component: FaqComponent,
    },
    // {
    //   path: 'notfound',
    //   component: NotFoundComponent,
    // },
    {
      path: 'unauthorized',
      component: UnauthorizedComponent,
    },
    // document
    {
      path: 'uploaddocument',
      component: UploadDocComponent,
      canActivate: [AuthGuard],
    },
    {
      path: 'downloaddocument',
      component: DownloadDocComponent,
      canActivate: [AuthGuard],
    },
    // {
    //   path: '**',
    //   redirectTo: 'notfound',
    // },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MasterPageRoutingModule { }
