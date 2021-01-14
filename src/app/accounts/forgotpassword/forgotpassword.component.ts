import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
// import * as Query from '../services/userqueries'
import { HttpClient, HttpEventType } from '@angular/common/http';
import { AccountsService } from '../../services/accounts.service';
// import { Login } from '../../models/accounts-model';
import { AuthenticationService } from '../../services/authentication.service';
import { Router } from '@angular/router';



@Component({
  selector: 'ngx-forgotpassword',
  templateUrl: './forgotpassword.component.html',
  styleUrls: ['./forgotpassword.component.scss'],
})
export class ForgotpasswordComponent implements OnInit {
  forgotForm: FormGroup;
  submitted = false;
  loading = false;

  title = 'Forgot Password';
  constructor(private _router: Router, private formBuilder: FormBuilder,
    private accservice: AccountsService, private _auth: AuthenticationService) {
    if (this._auth.loggedIn) {
      this._router.navigate(['dashboard']);
      // location.href = '/pages/dashboard';
    }
  }


  ngOnInit() {
    this.forgotForm = this.formBuilder.group({
      code: ['', [Validators.required]],
      username: ['', [Validators.required]],
    });
  }

  get f() { return this.forgotForm.controls; }

  sendFoprgotPw(): void {
    this.loading = true;
    const code = this.forgotForm.controls['code'].value;
    const username = this.forgotForm.controls['username'].value;
    const emailid = code + '_' + username;
    this.accservice.forgotPassword(emailid).subscribe(
      (data) => {
        if (data['payload'].isSuccess) {
          document.getElementById('forgotErrMsg').innerHTML =
            'Instructions to reset password mail has sent. <br/>Please check mail.';
          document.getElementById('forgotErrMsg').style.display = 'block';
          // document.getElementById('submitForgot').style.display = 'none';
          this.resetForm(this.forgotForm);
        } else {
          document.getElementById('forgotErrMsg').innerHTML = data['payload'].message;
          document.getElementById('forgotErrMsg').style.display = 'block';
        }
        this.loading = false;
      },
    );

  }

  onSubmitFP() {
    this.submitted = true;
    if (this.forgotForm.invalid) {
      return;
    }
    this.sendFoprgotPw();
  }
  backToLogin() {
    this._router.navigate(['/']);

  }


  public resetForm(form: FormGroup) {
    for (const key in form.controls) {
      if (key) {
        form.get(key).clearValidators();
        form.get(key).updateValueAndValidity();
      }
    }
    form.reset();
  }
}



