import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../../services/authentication.service';
import { MustMatch } from '../../common/validation';
import { Router } from '@angular/router';
import { AccountsService } from '../../services/accounts.service';
import { ResetPasswordVm } from '../../models/accounts-model';
import { CommonFunction } from '../../common/common-functions';

// import { Apollo } from 'apollo-angular';
// import * as Query from '../services/userqueries'
// import { HttpClient, HttpEventType } from '@angular/common/http';
// import { GlobalConstants } from '../common/global-constants';


@Component({
  selector: 'ngx-resetpassword',
  templateUrl: './resetpassword.component.html',
  styleUrls: ['./resetpassword.component.scss'],
})

export class ResetpasswordComponent implements OnInit {
  userId: null;
  code: null;
  sub: any;
  resetForm: FormGroup;
  submitted = false;
  loading = false;

  constructor(private accservice: AccountsService, private route: ActivatedRoute,
    private formBuilder: FormBuilder, private _auth: AuthenticationService,
    private _router: Router,
    private commonfunction: CommonFunction) {
    if (this._auth.loggedIn) {
      this._router.navigate(['dashboard']);
      // location.href = "/pages/dashboard";
    }

  }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.userId = params['userId'];
      this.code = params['code'];
    });

    this.resetForm = this.formBuilder.group({
      newPassword: ['', [Validators.required,
      Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{8,}')]],
      confirmPassword: ['', [Validators.required]],
    },
      {
        validators: [MustMatch('newPassword', 'confirmPassword')],
      },
    );

  }

  get f() { return this.resetForm.controls; }

  sendResetPw(): void {
    this.loading = true;
    // debugger;
    const objResetPw: ResetPasswordVm = new ResetPasswordVm();
    objResetPw.UserId = this.userId;
    objResetPw.Password = this.resetForm.controls['newPassword'].value,
      objResetPw.Code = this.code;


    this.accservice.resetPassword(objResetPw).subscribe(
      (data) => {
      //   debugger;
        if (data['payload'].isSuccess) {
          this.resetForm.controls['newPassword'].disable();
          this.resetForm.controls['confirmPassword'].disable();
          document.getElementById('submitReset').style.display = 'none';
          this.commonfunction.showToast('success', 'Success', 'Password reset successfully. Please Login to continue.');
        } else {
          this.commonfunction.showToast('danger', 'Error', data['payload'].message);
        }
        this.loading = false;
      },
    );
  }

  onSubmitResetPw() {
    this.submitted = true;
    // const dogBreed = this.breedForm.value;
    // alert('btnclick');
    // stop here if form is invalid
    if (this.resetForm.invalid) {
      return;
    }
    this.sendResetPw();
  }

  backToLogin() {
    this._router.navigate(['/']);
  }

}
