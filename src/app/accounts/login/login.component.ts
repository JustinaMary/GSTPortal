import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AccountsService } from '../../services/accounts.service';
import { Login } from '../../models/accounts-model';
import { AuthenticationService } from '../../services/authentication.service';
import {
  Router,
  // ActivatedRoute
} from '@angular/router';
import {
  // CookieService,
} from 'ngx-cookie-service';

@Component({
  selector: 'ngx-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  submitted = false;
  airlineArr: Array<any> = []; // List of airlines
  rememberMe = false;
  returnUrl: string;
  title = 'Login';
  constructor(private accservice: AccountsService,
    private _auth: AuthenticationService,
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private _router: Router,
    // private cookieService: CookieService,
  ) {
    if (this._auth.loggedIn) {
      this._router.navigate(['/dashboard']);
      // location.href = '/pages/dashboard';
    }
  }


  ngOnInit() {
    if (!this._auth.loggedIn) {
      // this.getAirlineData();
      this.loginForm = this.formBuilder.group({
        /*email: ['', [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]],*/
        code: ['', [Validators.required]],
        username: ['', [Validators.required]],
        password: ['', [Validators.required]],
        rememberMe: [''],
      });
    }

    // get return url from route parameters or default to '/'
    // jinal uncomment n check
    // this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

  }

  get f() { return this.loginForm.controls; }

  /*https://www.c-sharpcorner.com/article/how-to-get-the-client-ip-address-in-angular-application/*/
  public getIPAddress() {
    return this.http.get('https://api.ipify.org/?format=json');
  }

  login(): void {
    let ipadd = '';
    this.getIPAddress().subscribe((res: any) => {
      ipadd = res.ip;
      const objlogin: Login = new Login();
      objlogin.Email = this.loginForm.controls['code'].value + '_' + this.loginForm.controls['username'].value;
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
            data['payload'].ipAddress = ipadd;
            // this.cookieService.set('logdata', this._auth.encryptData(data['payload']));
            localStorage.setItem('logdata', this._auth.encryptData(data['payload']));

            // location.href = '/dashboard';
            this._router.navigate(['dashboard']);

          }


        },
      );
    });

  }

  onSubmitLogin() {
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    }

    this.login();


  }

  toggleRememberMe(event) {
    if (event.target.checked) {
      this.rememberMe = true;
    }
  }
}

