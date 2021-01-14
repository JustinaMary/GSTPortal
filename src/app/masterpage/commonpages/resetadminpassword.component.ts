import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { MustMatch } from '../../common/validation';
import Swal from 'sweetalert2';
import { AccountsService } from '../../services/accounts.service';
import { ResetPasswordInternalVm } from '../../models/accounts-model';
import { AuthenticationService } from '../../services/authentication.service';
import { Router } from '@angular/router';
import { CommonFunction } from '../../common/common-functions';


@Component({
  selector: 'ngx-resetadminpassword',
  templateUrl: './resetadminpassword.component.html',
})
export class ResetAdminPasswordComponent implements OnInit {
  resetAdminForm: FormGroup;
  submitted = false;
  title = 'Reset Password Internal';
  sub: any;
  airlineArr: Array<any> = []; // List of airlines

  constructor(private accservice: AccountsService, private formBuilder: FormBuilder,
    private _auth: AuthenticationService, private _router: Router,
    private commonfunction: CommonFunction) { }
  ngOnInit() {
    // this.getAirlineData();

    if (this._auth.getCustId() === 0 && this._auth.getAirlineId() === 0) {

    } else {
      const message = '401 Unauthorized page: ' + this.title;
      this.commonfunction.ErrorLogHdlFunc(message, this._auth.getUserId());
      this._router.navigate(['unauthorized']);
    }
    this.resetAdminForm = this.formBuilder.group({
      code: ['', [Validators.required]],
      username: ['', [Validators.required]],
      newPassword: ['', [Validators.required,
      Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{8,}')]],
      confirmPassword: ['', [Validators.required]],
    }, {
      validator: [
        MustMatch('newPassword', 'confirmPassword'),
      ],
    });
  }

  get f() { return this.resetAdminForm.controls; }

  resetPasswordInternal() {

    const objResetPwInt: ResetPasswordInternalVm = new ResetPasswordInternalVm();

    objResetPwInt.UserName = this.resetAdminForm.controls['code'].value +
      '_' + this.resetAdminForm.controls['username'].value;

    objResetPwInt.Password = this.resetAdminForm.controls['newPassword'].value;
    objResetPwInt.Id = this._auth.getUserId();
    objResetPwInt.IsSuperAdmin = true;

    this.accservice.resetPasswordInternal(objResetPwInt).subscribe(
      (data) => {
        // debugger;
        if (data['payload'].isSuccess) {
          Swal.fire(
            'Changed!',
            'Password changed successsfully.',
            'success',
          );
          this.onReset();

        } else {
          document.getElementById('resetAdminErrMsg').innerHTML = data['payload'].message;
          document.getElementById('resetAdminErrMsg').style.display = 'block';
        }


      },
    );


  }

  onSubmitResetInternalForm() {
    this.submitted = true;
    if (this.resetAdminForm.invalid) {
      return;
    }
    this.resetPasswordInternal();
  }

  onReset() {
    this.submitted = false;
    this.resetAdminForm.reset();
  }

}
