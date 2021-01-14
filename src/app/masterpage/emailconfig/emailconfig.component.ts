import { Component, OnInit, SecurityContext } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonService } from '../../services/common.service';
import { AuthenticationService } from '../../services/authentication.service';
import { CommonFunction } from '../../common/common-functions';
import { EmailFormatValidator } from '../../common/validation';
import { EmailConfiguration } from '../../models/common-model';
import { DomSanitizer } from '@angular/platform-browser';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';


@Component({
  selector: 'ngx-modal-content',
  template: `
    <div class="modal-header">
      <h4 class="modal-title pull-left">{{title}}</h4>
      <button type="button" class="close pull-right" aria-label="Close" (click)="bsModalRef.hide()">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
    <form [formGroup]="testForm" class="form-valide">
      <div class="row col-md-12">
      <div class="form-group">
      <p>Kindly enter the email address on which the test email has to be sent.</p>
      <p class="errorMsg" id=errorMsg></p>
      <input type="text" maxlength="200" nbInput fullWidth formControlName="email" fieldSize="small"
        [status]="(submitted && f.email.errors) ?'danger' : 'basic'" placeholder="abc@domain.com">
      <ng-container *ngIf="submitted && f.email.errors" class="invalid-feedback">
        <p class="caption status-danger" *ngIf="f.email.errors.required">Email Id is required</p>
        <p class="caption status-danger" *ngIf="f.email.errors.EmailFormatValidator">Please provide a valid Email Id</p>
      </ng-container>
    </div>
      </div>
      <div class="col-md-12">
            <button type="button" (click)="testEmailConfig()" class="appearance-filled float-right" [size]="'small'"
              [status]="'success'" nbButton [class.disabledBtn]="loading">
              <nb-icon nbPrefix class="fa fa-spinner fa-spin" pack="font-awesome"></nb-icon>Submit
            </button>
          </div>
      </form>
    </div>
  `,
})

export class EmailConfigTestComponent implements OnInit {
  title: string;
  response: Array<any> = [];
  defaultRowPerPage = 10;
  totalRows = 0;
  loading = false;
  submitted = false;
  testForm: FormGroup;
  airlineId = 0;

  constructor(public bsModalRef: BsModalRef,
    private _auth: AuthenticationService,
    private formBuilder: FormBuilder,
    private commonservice: CommonService,
    private sanitizer: DomSanitizer,
    private commonfunction: CommonFunction) { }

  ngOnInit() {
    this.airlineId = this._auth.getAirlineId();
    this.testForm = this.formBuilder.group({
      email: ['', [Validators.required, EmailFormatValidator]],
    });
  }

  get f() { return this.testForm.controls; }

  testEmailConfig(): void {
    this.submitted = true;
    if (this.testForm.valid) {
      this.loading = true;
      const emailId = this.sanitizer.sanitize(SecurityContext.HTML,
        this.testForm.controls['email'].value);
      this.commonservice.testEmailConfiguration(emailId, this.airlineId).subscribe(
        (data) => {
          if (data['isError'] === false) {
            this.commonfunction.showToast('success', 'Success', data['payload']);
            this.bsModalRef.hide();
            window.location.reload();
          } else {
            document.getElementById('errorMsg').innerHTML = data['payload'];
            this.commonfunction.showToast('danger', 'Failed', data['payload']);
          }
          this.loading = false;
        },
      );
    }
  }
}

@Component({
  selector: 'ngx-emailconfig-customer',
  templateUrl: './emailconfig.component.html',
})
export class EmailConfigComponent implements OnInit {
  configId = 0;
  airlineId = 0;
  configForm: FormGroup;
  submitted = false;
  loading = false;
  isDataExit = false;
  isTested = false;
  bsModalRef: BsModalRef;

  constructor(private commonservice: CommonService, private formBuilder: FormBuilder,
    private _auth: AuthenticationService,
    private commonfunction: CommonFunction,
    private sanitizer: DomSanitizer,
    private modalService: BsModalService) { }

  ngOnInit(): void {
    this.airlineId = this._auth.getAirlineId();
    this.configForm = this.formBuilder.group({
      email: ['', [Validators.required, EmailFormatValidator]],
      password: ['', [Validators.required]],
      fromTitle: ['', [Validators.required]],
      smtpServer: ['', [Validators.required]],
      portNumber: ['', [Validators.required]],
    });
    this.getEmailConfig();
  }

  get f() { return this.configForm.controls; }

  submitEmailConfig(): void {
    this.submitted = true;
    if (this.configForm.valid) {
      this.loading = true;
      const objEmailConfig: EmailConfiguration = new EmailConfiguration();
      objEmailConfig.Email = this.sanitizer.sanitize(SecurityContext.HTML,
        this.configForm.controls['email'].value);
      objEmailConfig.Password = this.sanitizer.sanitize(SecurityContext.HTML,
        this.configForm.controls['password'].value);
      objEmailConfig.FromTitle = this.sanitizer.sanitize(SecurityContext.HTML,
        this.configForm.controls['fromTitle'].value);
      objEmailConfig.SmtpServer = this.sanitizer.sanitize(SecurityContext.HTML,
        this.configForm.controls['smtpServer'].value);
      const portNumber = this.configForm.controls['portNumber'].value;
      objEmailConfig.PortNumber = portNumber;
      objEmailConfig.AirlineId = this.airlineId;
      objEmailConfig.CreatedBy = this._auth.getUserId();
      this.commonservice.postEmailConfiguration(objEmailConfig).subscribe(
        (data) => {
          if (data['code'] === 200) {
            this.commonfunction.showToast('success', 'Success', 'Record inserted successfully..');
            this.isTested = false;
          } else {
            this.commonfunction.showToast('danger', 'Failed', 'Something went wrong..');
          }
          this.loading = false;
        },
      );
    }
  }

  getEmailConfig(): void {
    this.commonservice.getEmailConfiguration(this.airlineId).subscribe(
      (data) => {
        if (data['isError'] === false && data['code'] === 200) {
          this.isDataExit = true;
          const emailConfigData = data['payload'];
          this.configForm.get('email').setValue(emailConfigData['email']);
          this.configForm.get('password').setValue(emailConfigData['password']);
          this.configForm.get('fromTitle').setValue(emailConfigData['fromTitle']);
          this.configForm.get('smtpServer').setValue(emailConfigData['smtpServer']);
          this.configForm.get('portNumber').setValue(emailConfigData['portNumber']);
          this.isTested = emailConfigData['isTested'];
        }
      },
    );
  }

  onReset() {
    this.submitted = false;
    if (this.isDataExit) {
      this.getEmailConfig();
    } else {
      this.configForm.get('email').setValue('');
      this.configForm.get('password').setValue('');
      this.configForm.get('fromTitle').setValue('');
      this.configForm.get('smtpServer').setValue('');
      this.configForm.get('portNumer').setValue('');
    }
  }

  openModalWithComponent() {
    const initialState = {
      title: 'Test Configuration',
    };
    this.bsModalRef = this.modalService.show(EmailConfigTestComponent, { initialState });
  }
}
