import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  Component, OnInit, SecurityContext, ChangeDetectionStrategy,
  ChangeDetectorRef, ViewChild, ElementRef,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HomeServices } from '../services/home.service';
import { Login, Register, B2CGstRequest } from '../models/home-model';
import { AuthenticationService } from '../services/authentication.service';
import {
  Router,
  // ActivatedRoute
} from '@angular/router';
import {
  // CookieService,
} from 'ngx-cookie-service';
import { NbDateService } from '@nebular/theme';
import { PANFormatValidator, GSTFormatValidator, EmailFormatValidator, Validation } from '../common/validation';
import { DomSanitizer } from '@angular/platform-browser';
import { CommonFunction } from '../common/common-functions';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MustMatch } from '../common/validation';
import { ResetPasswordInternalVm } from '../models/accounts-model';
import { AccountsService } from '../services/accounts.service';
import { AirlineService } from '../services/airline.service';
import { CustomerService } from '../services/customer.service';

@Component({
  selector: 'ngx-app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
   templateUrl: './home.component.html',
  // templateUrl: './airlinegst.component.html',
  styleUrls: ['home.component.scss'],
  // styleUrls: ['airlinegst.component.scss'],
})
export class HomeComponent implements OnInit {

  loginForm: FormGroup;
  registerForm: FormGroup;
  documentForm: FormGroup;
  resetPwForm: FormGroup;

  loginsubmitted = false;
  resetpwsubmitted = false;
  registersubmitted = false;
  documentsubmitted = false;
  rememberMe = false;
  linearMode = true;
  max: Date;
  gstFile: File = null;
  panFile: File = null;
  messages: Array<any> = [];
  errors: Array<any> = [];

  popupText = '';
  popupName = 'content';
  show = false;
  emailVerified = false;
  loading = false;
  showResetDiv = false;
  userId = '';
  airlineArr: Array<any> = []; // List of airlines
  airlineLuf: Array<any> = []; // List of airlines
  defaultAirline = '';
  defaultLufthansa = '';
  fileExtensions = ['pdf', 'png', 'jpg'];
  // to reset the file
  @ViewChild('panDoc') panDoc: ElementRef;
  @ViewChild('gstDoc') gstDoc: ElementRef;

  constructor(private homeService: HomeServices,
    private _auth: AuthenticationService,
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private _router: Router,
    // private cookieService: CookieService,
    protected dateService: NbDateService<Date>,
    private sanitizer: DomSanitizer,
    private accservice: AccountsService,
    // tslint:disable-next-line:max-line-length
    private commonfunction: CommonFunction,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    private airservice: AirlineService,
    private custservice: CustomerService,
    private validation: Validation) {
    if (this._auth.loggedIn) {
      this._router.navigate(['/dashboard']);
      // location.href = '/pages/dashboard';
    }
    this.max = this.dateService.today();
  }

  ngOnInit() {
    if (!this._auth.loggedIn) {
      // this.getAirlineData();
      this.loginForm = this.formBuilder.group({
        code: ['', [Validators.required]],
        username: ['', [Validators.required]],
        password: ['', [Validators.required]],
        rememberMe: [''],
      });

      this.resetPwForm = this.formBuilder.group({
        newPassword: ['', [Validators.required,
        Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{8,}')]],
        confirmPassword: ['', [Validators.required]],
      }, {
        validator: [
          MustMatch('newPassword', 'confirmPassword'),
        ],
      });

      this.registerForm = this.formBuilder.group({
        clientName: ['', [Validators.required]],
        panNo: ['', [Validators.required, PANFormatValidator]],
        gstNo: ['', [Validators.required, GSTFormatValidator, this.validation.IsGSTContainsPAN]],
        pnrNo: [''],
        ticketNo: ['', [this.validation.IsAirlineExist]],
        issuedDate: [''],
        code: ['', [Validators.required]],
        email: ['', [Validators.required, EmailFormatValidator]],
        contactNo: ['', [Validators.required, this.validation.IsContactNoExist]],
        panDoc: ['', [Validators.required]],
        gstDoc: ['', [Validators.required]],
        userId: ['00000000-0000-0000-0000-000000000000'],
      }, {
        validator: [
          this.validation.IsAirlineExist('ticketNo'),
          this.validation.IsGSTContainsPAN('gstNo'),
          this.validation.IsContactNoExist('contactNo', 'userId'),
          this.commonfunction.UniqueEmailCheck('email', 'userId'),
        ],
      });

      this.documentForm = this.formBuilder.group({
        docTicketNo: ['', [Validators.required]],
        docPnrNo: ['', [Validators.required]],
        docGstNo: ['', [GSTFormatValidator]],
        docIssuedDate: ['', [Validators.required]],
        docEmail: ['', [Validators.required, EmailFormatValidator]],
        docContactNo: ['', [Validators.required]],
        emailOtp: [''],
      }, {
        validator: [
          this.validation.IsAirlineExist('docTicketNo'),
        ],
      });

      this.getAirlineData();
    }
  }

  get f() { return this.loginForm.controls; }
  get g() { return this.registerForm.controls; }
  get h() { return this.documentForm.controls; }
  get i() { return this.resetPwForm.controls; }



  public getIPAddress() {
    return this.http.get('https://api.ipify.org/?format=json');
  }

  login(): void {
    this.loading = true;
    let ipadd = '';
    this.getIPAddress().subscribe((res: any) => {
      ipadd = res.ip;
      const objlogin: Login = new Login();
      objlogin.Email = this.sanitizer.sanitize(SecurityContext.HTML,
        this.loginForm.controls['code'].value + '_' + this.loginForm.controls['username'].value);
      objlogin.Password = this.loginForm.controls['password'].value;
      objlogin.IpAddress = ipadd;
      objlogin.RememberMe = this.rememberMe;
      this.homeService.login(objlogin).subscribe(
        (data) => {
          if (data['isError'] === true) {
            this.errors.push(data['error']);
            for (let i = 0; i < this.errors.length; i++) {
              this.commonfunction.showToast('danger', 'Error', this.errors[i].value);
              this.errors = [];
              this.loading = false;
              this.cdr.detectChanges(); // *trigger change here*
            }
          } else {
            if (data['payload'].message === 'Success') {
              if (data['payload'].isResetPassword === false) {
                this.userId = data['payload'].userId;
                this.showResetDiv = true;
                this.loading = false;
              } else {
                this.resetForm(this.loginForm);
                data['payload'].ipAddress = ipadd;
                // this.cookieService.set('logdata', this._auth.encryptData(data['payload']));
                localStorage.setItem('logdata', this._auth.encryptData(data['payload']));

                if (data['payload'].custId > 0) {
                  this.custservice.getCustomerRequest(0).subscribe(
                    (data2) => {
                      if (data2['isError'] === false && data2['code'] === 200
                        && data2['payload'].length === 1 && data2['payload'][0].status === 2
                        && data2['payload'][0].isAutoRegistered === true) {
                        let id: number = 0;
                        let idstr: string = '';
                        id = data2['payload'][0].reqId;
                        const obj = {
                          reqId: id,
                        };
                        idstr = this._auth.encryptData(obj);
                        this._router.navigate(['profile/' + idstr]);
                      } else {
                        location.href = '/dashboard';
                      }
                    },
                  );

                } else {
                  location.href = '/dashboard';
                }
              }
            } else {
              this.commonfunction.showToast('danger', 'Error', data['payload'].message);
              this.loading = false;
              this.cdr.detectChanges(); // *trigger change here*
            }
          }
        },
      );
    });
  }

  forceResetPassword(): void {
    this.loading = true;
    const objResetPwInt: ResetPasswordInternalVm = new ResetPasswordInternalVm();
    objResetPwInt.UserName = this.sanitizer.sanitize(SecurityContext.HTML,
      this.loginForm.controls['code'].value + '_' + this.loginForm.controls['username'].value);
    objResetPwInt.Password = this.resetPwForm.controls['newPassword'].value;
    objResetPwInt.Id = this.userId;
    objResetPwInt.IsSuperAdmin = false;

    this.accservice.resetPasswordInternal(objResetPwInt).subscribe(
      (data) => {
        if (data['payload'].isSuccess) {
          this.loginForm.get('password').setValue(this.resetPwForm.controls['newPassword'].value);
          this.login();
        }
        // else {
        //   document.getElementById('resetAdminErrMsg').innerHTML = data['payload'].message;
        //   document.getElementById('resetAdminErrMsg').style.display = 'block';
        // }
      },
    );
  }


  register(): void {
    this.loading = true;
    const objregister: Register = new Register();
    objregister.TicketNo = this.registerForm.controls['ticketNo'].value;
    objregister.PNR = this.registerForm.controls['pnrNo'].value;
    objregister.CustomerName = this.registerForm.controls['clientName'].value;
    objregister.PANNo = this.registerForm.controls['panNo'].value;
    objregister.GstNo = this.registerForm.controls['gstNo'].value;
    objregister.Email = this.registerForm.controls['email'].value;
    objregister.Mobile = this.registerForm.controls['contactNo'].value;
    objregister.AirlineId = this.registerForm.controls['code'].value;
    objregister.IsAutoRegistered = true;

    const date = this.registerForm.controls['issuedDate'].value;
    const year = new Date(date).getFullYear();
    const month = new Date(date).getMonth() + 1;
    const day = new Date(date).getDate();
    objregister.DateofIssue = year + '-' + month + '-' + day + ' ' + '00:00:00';
    // hits the API service
    this.homeService.register(objregister).subscribe(
      (data) => {
        if (data['isError'] === true) {
          this.errors.push(data['error']);
          for (let i = 0; i < this.errors.length; i++) {
            this.commonfunction.showToast('danger', 'Error', this.errors[i].value);
            this.errors = [];
            this.loading = false;
          }
        } else {
          if (data['code'] === 200) {
            if (data['payload'].message) {
              this.resetForm(this.registerForm);
              document.getElementById('openModalButton').click();
              this.popupText = data['payload'].message;
              this.loading = false;
            } else {
              let isSuccess = true;
              const reqId = data['payload'].reqId;
              // send PAN document
              const formData: FormData = new FormData();
              formData.append('reqId', reqId);
              formData.append('docType', '10');  // PAN doc type
              formData.append('file', this.panFile, this.panFile.name);
              this.homeService.customerDocUpload(formData).subscribe(
                (panData) => {
                  if (panData['isError'] === true) {
                    this.commonfunction.showToast('danger', 'Error', panData['error']);
                    isSuccess = false;
                  }
                });

              // send GST document
              const formData1: FormData = new FormData();
              formData1.append('reqId', reqId);
              formData1.append('docType', '11');  // GST doc type
              formData1.append('file', this.gstFile, this.gstFile.name);
              this.homeService.customerDocUpload(formData1).subscribe(
                (gstData) => {
                  if (gstData['isError'] === true) {
                    this.commonfunction.showToast('danger', 'Error', gstData['error']);
                    isSuccess = false;
                  }
                });

              if (isSuccess) {
                this.resetForm(this.registerForm);
                document.getElementById('openModalButton').click();
                this.popupText = 'Thank you for registering with us, kindly check your email for further details';
                this.loading = false;
              }

            }
          }
        }
      },
    );
  }

  gstRequest(): void {
    this.loading = true;
    const gstRequest: B2CGstRequest = new B2CGstRequest();
    gstRequest.Email = this.documentForm.controls['docEmail'].value;
    gstRequest.ContactNo = this.documentForm.controls['docContactNo'].value;
    gstRequest.GSTNo = this.documentForm.controls['docGstNo'].value;
    gstRequest.PNR = this.documentForm.controls['docPnrNo'].value;
    gstRequest.TicketNumber = this.documentForm.controls['docTicketNo'].value;
    const date = this.documentForm.controls['docIssuedDate'].value;

    const year = new Date(date).getFullYear();
    const month = new Date(date).getMonth() + 1;
    const day = new Date(date).getDate();
    const dateString = year + '-' + month + '-' + day + ' ' + '00:00:00';
    gstRequest.DateOfIssue = new Date(dateString);
    this.homeService.b2cRaiseRequest(gstRequest).subscribe(
      (data) => {
        if (data['isError'] === true) {
          this.commonfunction.showToast('danger', 'Error', data['error']);
          this.loading = false;

        } else {
          this.resetForm(this.documentForm);
          document.getElementById('openModalButton').click();
          this.popupText = data['payload'];
          this.loading = false;
        }
      });
  }

  onSubmitLogin() {
    this.loginsubmitted = true;
    if (this.loginForm.invalid) {
      return;
    }
    this.login();
  }

  onSubmitResetPW() {
    this.resetpwsubmitted = true;
    if (this.resetPwForm.invalid) {
      return;
    }
    this.forceResetPassword();
  }

  onSubmitRegister() {
    this.registersubmitted = true;
    if (this.registerForm.invalid) {
      return;
    }
    this.register();
  }

  onSubmitDocument() {
    this.documentsubmitted = true;
    if (this.documentForm.invalid) {
      return;
    }
    if (!this.emailVerified) {
      this.commonfunction.showToast('warning', 'Verify Email', 'Kindly verify your Email to proceed further.');
    }
    this.gstRequest();
  }
  toggleRememberMe(checked: boolean) {
    this.rememberMe = checked;
  }
  handlePanUpload(files: FileList) {
    if (this.validation.validateFile(files[0].name, this.fileExtensions)) {
      this.panFile = files.item(0);
    } else {
      this.commonfunction.showToast('warning', 'Format not Supported', 'Selected file format is not supported !');
      this.panDoc.nativeElement.value = null;
    }
  }
  handleGstUpload(files: FileList) {
    if (this.validation.validateFile(files[0].name, this.fileExtensions)) {
      this.gstFile = files.item(0);
    } else {
      this.commonfunction.showToast('warning', 'Format not Supported', 'Selected file format is not supported !');
      this.gstDoc.nativeElement.value = null;

    }
  }

  openPopup(content) {
    this.modalService.open(content, { centered: true });
  }

  isEmailVerified(event: any) {
    const email = event.target.value;
    if (email && this.documentForm.get('docEmail').valid) {
      this.homeService.isEmailVerified(email).subscribe(
        (data) => {
          if (data['code'] === 200) {
            if (data['payload'] === false) {
              this.show = true;
              this.cdr.detectChanges(); // *trigger change here*
              // this.registerForm.controls['emailOtp'].setValidators([Validators.required, Validators.maxLength(6)]);
              this.homeService.sendOtpEmail(email).subscribe(
                (otpdata) => {
                  if (otpdata['isError'] === false)
                    this.commonfunction.showToast('success', 'Mail Sent', 'OTP has sent to your Email');
                  else
                    this.commonfunction.showToast('danger', 'Error', 'Something went wrong !');
                });
            } else {
              this.show = false;
              this.emailVerified = true;
            }
          }
        });
    } else {
      this.show = false;
    }
  }

  verifOtp(event: any) {
    const otp = event.target.value;
    const email = this.documentForm.controls['docEmail'].value;
    if (otp && email) {
      this.homeService.verifyOtp(email, otp).subscribe(
        (data) => {
          if (data['isError'] === true) {
            this.commonfunction.showToast('danger', 'Error', data['error']);
          } else {
            this.emailVerified = true;
            this.commonfunction.showToast('success', 'Sussess', 'OTP verified successfully');
            this.cdr.detectChanges(); // *trigger change here*
          }
        });
    }
  }

  public resetForm(form: FormGroup) {
    for (const key in form.controls) {
      if (key) {
        form.get(key).clearValidators();
        form.get(key).updateValueAndValidity();
      }
    }
    form.reset();
    if (form === this.registerForm) {
      this.registersubmitted = false;
      form.get('code').setValue('');
    }
    // for (const key in form.controls) {
    //   if (key) {
    //     form.get(key).validator = ;
    //     form.get(key).updateValueAndValidity();
    //   }
    // }
  }

  // Get Airline Master Data
  getAirlineData(airlineid = 0) {
    this.airservice.getAirlineMasterList(airlineid).subscribe(
      (data) => {
        if (data['isError'] === false && data['code'] === 200) {
          this.airlineArr = data['payload'];
          this.defaultAirline = data['payload'][0].digit3Code;

          this.airlineLuf = data['payload'].filter(x => x.digit3Code === '220');
          this.defaultLufthansa = data['payload'].filter(x => x.digit3Code === '220')[0].airlineId;
        } else {
          this.airlineArr = [];
        }
      },
    );
  }

}
