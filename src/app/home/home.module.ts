import { NgModule } from '@angular/core';
import {
  NbMenuModule,
  NbTabsetModule,
  NbInputModule,
  NbIconModule,
  NbFormFieldModule,
  NbButtonModule,
  NbCheckboxModule,
  NbStepperModule,
  NbDatepickerModule,
  NbAlertModule,
  NbSpinnerModule,
  NbSelectModule,
  NbOptionModule,
} from '@nebular/theme';
import { ThemeModule } from '../@theme/theme.module';
import { HomeComponent } from './home.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NbMomentDateModule } from '@nebular/moment';
import { OnlyNumberDirective } from '../home/home.directive';

const routes: Routes = [{
  path: '',
  component: HomeComponent,
}];

@NgModule({
  imports: [
    ThemeModule,
    NbMenuModule,
    NbFormFieldModule,
    NbTabsetModule,
    NbInputModule,
    NbIconModule,
    NbButtonModule,
    FormsModule,
    ReactiveFormsModule,
    NbCheckboxModule,
    NbStepperModule,
    NbDatepickerModule,
    NbMomentDateModule,
    NbAlertModule,
    NbSpinnerModule,
    NbSelectModule,
    NbOptionModule,
    RouterModule.forChild(routes),
  ],
  declarations: [
    HomeComponent,
    OnlyNumberDirective,
  ],
})
export class HomeModule {

}
