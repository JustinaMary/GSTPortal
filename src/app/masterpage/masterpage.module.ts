import { NgModule } from '@angular/core';
import {
  NbActionsModule,
  NbButtonModule,
  NbCardModule,
  NbCheckboxModule,
  NbDatepickerModule, NbIconModule,
  NbInputModule,
  NbRadioModule,
  NbSelectModule,
  NbUserModule,
  NbTooltipModule,
  NbPopoverModule,
  NbFormFieldModule,
  NbMenuModule,
  NbListModule,
  NbSpinnerModule,
  NbTreeGridModule,
  NbAccordionModule,
} from '@nebular/theme';
import { ThemeModule } from '../@theme/theme.module';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule as ngFormsModule, ReactiveFormsModule } from '@angular/forms';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { InputTrimModule } from 'ng2-trim-directive';
import { NbMomentDateModule } from '@nebular/moment';
import { ModalModule } from 'ngx-bootstrap/modal';

// masterpage
import { MasterPageRoutingModule } from './masterpage-routing.module';
import { MasterPageComponent } from './masterpage.component';
// airline
import { CreateComponent } from './airline/airline-master/create.component';
import { EditComponent } from './airline/airline-master/edit.component';
import { ListComponent } from './airline/airline-master/list.component';
import { StateCreateComponent } from './airline/airline-states/create.component';
import { StateEditComponent } from './airline/airline-states/edit.component';
import { StateListComponent } from './airline/airline-states/list.component';
import { UserListComponent } from './airline/airline-users/list.component';
import { UserCreateComponent } from './airline/airline-users/create.component';
import { UserEditComponent } from './airline/airline-users/edit.component';
import { TransTypeListComponent } from './airline/transaction-type/list.component';
import { TransTypeCreateComponent } from './airline/transaction-type/create.component';
import { TransTypeEditComponent } from './airline/transaction-type/edit.component';

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
import { BulkRequestComponent } from './customer/raise-request/list.component';
import { BulkUploadResponseComponent } from './customer/raise-request/list.component';

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
import { FaqComponent } from '../masterpage/commonpages/faq.component';
import { UsermanualComponent } from '../masterpage/commonpages/usermanual.component';


import { EmailConfigComponent } from '../masterpage/emailconfig/emailconfig.component';
import { EmailConfigTestComponent } from '../masterpage/emailconfig/emailconfig.component';


// document
import { UploadDocComponent } from '../masterpage/document/upload/uploaddoc.component';
import { DownloadDocComponent } from '../masterpage/document/download/downloaddoc.component';
import { ProgressComponent } from '../masterpage/document/progress/progress.component';
import { DocumentDirective } from '../masterpage/document/document.directive';
import { ChartsModule } from 'ng2-charts';
import { ChartModule } from 'angular2-chartjs';
import { ChartjsBarComponent } from '../masterpage/commonpages/chartjs-bar.component';
import { NgCircleProgressModule } from 'ng-circle-progress';

@NgModule({
  declarations: [
    MasterPageComponent,
    // airline
    CreateComponent,
    EditComponent,
    ListComponent,
    StateCreateComponent,
    StateEditComponent,
    StateListComponent,
    UserListComponent,
    UserCreateComponent,
    UserEditComponent,
    TransTypeListComponent,
    TransTypeCreateComponent,
    TransTypeEditComponent,
    // customer
    CCreateComponent,
    // CreateNonLoginComponent,
    DetailComponent,
    ProfileComponent,
    CListComponent,
    CStateCreateComponent,
    CStateEditComponent,
    CStateListComponent,
    CUserListComponent,
    CUserCreateComponent,
    CUserEditComponent,
    RaiseRequestCreateComponent,
    RaiseRequestEditComponent,
    RaiseRequestListComponent,
    RaiseRequestDetailComponent,
    B2CGstRequestListComponent,
    BulkRequestComponent,
    BulkUploadResponseComponent,
    // menu
    MenuMasterComponent,
    MenuActionComponent,
    // commonpages
    ManagePasswordComponent,
    ResetAdminPasswordComponent,
    UnauthorizedComponent,
    NotificationsComponent,
    DashboardComponent,
    MyProfileComponent,
    FaqComponent,
    UsermanualComponent,
    // email config
    EmailConfigComponent,
    EmailConfigTestComponent,
    // document
    UploadDocComponent,
    DownloadDocComponent,
    ProgressComponent,
    DocumentDirective,
    ChartjsBarComponent,
  ],
  imports: [
    CommonModule,
    ThemeModule,
    NbInputModule,
    NbCardModule,
    NbButtonModule,
    NbActionsModule,
    NbUserModule,
    NbCheckboxModule,
    NbRadioModule,
    NbDatepickerModule,
    NbSelectModule,
    NbIconModule,
    NbTooltipModule,
    NbPopoverModule,
    NbFormFieldModule,
    NbMenuModule,
    Ng2SmartTableModule,
    ngFormsModule,
    MasterPageRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    InputTrimModule,
    NbListModule,
    NbSpinnerModule,
    NbTreeGridModule,
    NbMomentDateModule,
    NbAccordionModule,
    ChartsModule,
    ChartModule,
    NgCircleProgressModule.forRoot({
      // set defaults here
      radius: 100,
      outerStrokeWidth: 16,
      innerStrokeWidth: 8,
      outerStrokeColor: '#78C000',
      innerStrokeColor: '#C7E596',
      animationDuration: 300,
    }),
    ModalModule.forRoot(),
  ],
})
export class MasterPageModule { }
