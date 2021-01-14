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
  NbCardModule,
} from '@nebular/theme';
import { ThemeModule } from '../@theme/theme.module';
import { NotFoundComponent } from './notfound.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NbMomentDateModule } from '@nebular/moment';

const routes: Routes = [{
  path: '',
  component: NotFoundComponent,
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
    NbCardModule,
    RouterModule.forChild(routes),
  ],
  declarations: [
    NotFoundComponent,
  ],
})
export class NotFoundModule {

}
