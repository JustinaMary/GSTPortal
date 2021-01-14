import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonFunction } from '../../../common/common-functions';
import { CustomerService } from '../../../services/customer.service';
import { CommonService } from '../../../services/common.service';
import { AuthenticationService } from '../../../services/authentication.service';
import { UserLog } from '../../../models/common-model';
import { VerifyRequest } from '../../../models/customer-model';
import { AccountsService } from '../../../services/accounts.service';


@Component({
  selector: 'ngx-detail-custregireq',
  templateUrl: './detail.component.html',
})
export class DetailComponent implements OnInit {
  custRegiReqForm: FormGroup;
  submitted = false;
  title = '';
  sub: any;
  panLink = '';
  gstLink = '';
  statusText = '';
  ReqId = 0;
  isDisabled = false;
  loading = false;
  enumStatusArr: Array<any> = []; // List of airlines
  IsAirlineUserLogin = false;
  requestDetail = null;
  accessArr: Array<any> = []; // List of menuaccess

  constructor(private formBuilder: FormBuilder,
    private route: ActivatedRoute, private _router: Router,
    private custservice: CustomerService,
    private commservice: CommonService,
    private accservice: AccountsService,
    private _auth: AuthenticationService,
    private commonfunction: CommonFunction) {
      this.sub = this.route.params.subscribe(params => {
        const id = this._auth.decryptData(params['reqId']) || 0;
        this.ReqId = id['reqId'] || 0;

        this.accservice.getGetUserActions(this._auth.getUserId()).subscribe(
          (data) => {
            if (data['message'] === 'Success') {
              this.accessArr = data['payload'];
              if (this.accessArr.filter(t => t.actionName === 'Update' && t.module === 'Customer Request').length > 0) {
                this.getEnumStatusList();
                this.getCustReqData(this.ReqId);
              } else {
                const message = '401 Unauthorized page: Customer Register Request Details';
                this.commonfunction.ErrorLogHdlFunc(message, this._auth.getUserId());
                this._router.navigate(['unauthorized']);
              }

            }
          });
      });
     }


  ngOnInit() {
    this.custRegiReqForm = this.formBuilder.group({
      Notes: ['', [Validators.required]],
      Status: [''],
    });

  }

  get f() { return this.custRegiReqForm.controls; }

  onSubmit() {
    this.submitted = true;
    if (this.custRegiReqForm.invalid) {
      return;
    }
    this.verifyRequest();

  }

  onList(): void {
    this._router.navigate(['customerList']);
  }

  // Get cust detail Data
  getCustReqData(reqid = 0) {
    this.custservice.getCustomerRequest(reqid).subscribe(
      (data) => {
        // let custArr: Array<any> = []; // List of Customer

        if (data['isError'] === false && data['code'] === 200) {
          // custArr = data['payload'];
          this.requestDetail = data['payload'][0];
        } else {
          // custArr = [];
        }
        // to check is admin user ligin start=========
        if (this._auth.getAirlineId() > 0 || this._auth.getRoleName() === 'Airline Admin') {
          this.IsAirlineUserLogin = true;
        }
        // to check is admin user ligin end=========
        if (reqid > 0) {
          this.custRegiReqForm.get('Status').setValue(this.requestDetail.status);
          this.custRegiReqForm.get('Notes').setValue(this.requestDetail.notes);
          if (this.requestDetail.verifiedOn === '0001-01-01T00:00:00') {
            this.requestDetail.verifiedOn = '';
          }
          this.statusText = this.enumStatusArr.filter(x => x.enumId === this.requestDetail.status)[0].description;
          if (this.requestDetail.document.filter(x => x.docType === 10).length > 0) {
            this.panLink = this.requestDetail.document.filter(x => x.docType === 10)[0].docPath;
          }
          if (this.requestDetail.document.filter(x => x.docType === 11).length > 0) {
            this.gstLink = this.requestDetail.document.filter(x => x.docType === 11)[0].docPath;
          }
        }
      },
    );
  }


  verifyRequest() {
    this.isDisabled = true;
    this.loading = true;
    const objVerifyReq: VerifyRequest = new VerifyRequest();
    objVerifyReq.ReqId = this.ReqId;
    objVerifyReq.LUserId = this._auth.getUserId();
    objVerifyReq.Status = this.custRegiReqForm.controls['Status'].value;
    objVerifyReq.Notes = this.custRegiReqForm.controls['Notes'].value;

    this.custservice.verifyCustomer(objVerifyReq).subscribe(
      (data) => {
        // debugger;
        if (data['isError'] === false && data['code'] === 200) {
          this.commonfunction.showToast('success', 'Success', 'Successfully saved');

          const objULog: UserLog = new UserLog();
          objULog.Action = 'Change Status of Customer Register Request';
          objULog.UserId = this._auth.getUserId();
          objULog.PageName = 'detail';
          objULog.Notes = 'Change Status of Customer Register Request';

          this.commservice.insertUserLog(objULog).subscribe(data3 => {
            // do something, success
          }, error => { alert(error); });
          setTimeout(() => {
            this._router.navigate(['customerList']);
          }, 1500);
        } else {
          this.commonfunction.showToast('danger', 'Failed', 'Not saved');
        }
        this.isDisabled = false;
        this.loading = false;
      },
    );

  }

  // Get cust detail Data
  getEnumStatusList() {
    this.commservice.getEnumData('CRS').subscribe(
      (data) => {

        if (data['isError'] === false && data['code'] === 200) {
          this.enumStatusArr = data['payload'];
        } else {
          this.enumStatusArr = [];
        }

        // console.log(this.enumStatusArr);
      },
    );
  }
  onStatusChange(value) {
    if (value === 4 || value === 14) {
      this.custRegiReqForm.get('Notes').validator = <any>Validators.compose([Validators.required]);
    } else {
      this.custRegiReqForm.get('Notes').clearValidators();
    }
    this.custRegiReqForm.get('Notes').updateValueAndValidity();
  }
}

