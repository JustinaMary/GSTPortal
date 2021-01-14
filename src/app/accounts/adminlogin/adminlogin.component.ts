import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
/*import { AuthenticationService } from '../_service/authentication.service';*/
// import { Router } from '@angular/router';HttpEventType
import { HttpClient } from '@angular/common/http';
import { AccountsService } from '../../services/accounts.service';
import { Login } from '../../models/accounts-model';
import { AuthenticationService } from '../../services/authentication.service';
import { Router } from '@angular/router';
import {
  // CookieService,
} from 'ngx-cookie-service';


@Component({
  selector: 'ngx-adminlogin',
  templateUrl: './adminlogin.component.html',
  styleUrls: ['./adminlogin.component.scss'],
})
export class AdminLoginComponent implements OnInit {
  loginForm: FormGroup;
  submitted = false;
  rememberMe = false;

  title = 'Admin Login';

  constructor(private accservice: AccountsService, private _auth: AuthenticationService, // private _router: Router,
    private formBuilder: FormBuilder, private http: HttpClient, private _router: Router,
    ) { // private cookieService: CookieService
    if (this._auth.loggedIn) {
      this._router.navigate(['/dashboard']);
      // location.href = '/pages/dashboard';
    }

  }

  ngOnInit() {
    if (!this._auth.loggedIn) {
      this.loginForm = this.formBuilder.group({
        // email: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$')]],
        email: ['', [Validators.required]],
        password: ['', [Validators.required]],
        rememberMe: [''],
      });
    }
  }

  get f() { return this.loginForm.controls; }

  /*https://www.c-sharpcorner.com/article/how-to-get-the-client-ip-address-in-angular-application/*/
  public getIPAddress() {
    return this.http.get('https://api.ipify.org/?format=json');
  }

  adminLogin(): void {

    let ipadd = '';
    this.getIPAddress().subscribe((res: any) => {
      ipadd = res.ip;
      const objlogin: Login = new Login();
      // objlogin.Email = 'tushar@pikateck.com';
      // objlogin.Password = 'Tushar@123';
      // objlogin.IpAddress = ipadd;
      // objlogin.RememberMe = true;
      objlogin.Email = this.loginForm.controls['email'].value;
      objlogin.Password = this.loginForm.controls['password'].value;
      objlogin.IpAddress = ipadd;
      objlogin.RememberMe = this.rememberMe;

      this.accservice.login(objlogin).subscribe(
        (data) => {
          if (data['payload'].message !== 'Success') {
            document.getElementById('loginErrMsg').innerHTML = data['payload'].message;
            document.getElementById('loginErrMsg').style.display = 'block';

            setTimeout(() => {
              document.getElementById('loginErrMsg').style.display = 'none';
            }, 5000);

          } else {
            localStorage.setItem('logdata', this._auth.encryptData(data['payload']));
            // this.cookieService.set('logdata', this._auth.encryptData(data['payload']));

            location.href = '/dashboard';
          }

        },
      );
    });




  }

  onSubmitAdmin() {
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    }

    this.adminLogin();


  }
  toggleRememberMe(event) {
    if (event.target.checked) {
      this.rememberMe = true;
    }
  }


}






