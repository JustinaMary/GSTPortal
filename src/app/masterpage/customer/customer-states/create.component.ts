import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit, Input, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { AirlineService } from '../../../services/airline.service';
import { CommonFunction } from '../../../common/common-functions';
import { AuthenticationService } from '../../../services/authentication.service';
import { CustomerService } from '../../../services/customer.service';
import { CustomerStateMaster } from '../../../models/customer-model';

import { UserLog } from '../../../models/common-model';
import { CommonService } from '../../../services/common.service';
import { AccountsService } from '../../../services/accounts.service';
import { GSTLast3DigitValidator } from '../../../common/validation';



@Component({
  selector: 'ngx-create-state-customer',
  templateUrl: './create.component.html',
})

export class CStateCreateComponent implements OnInit {
  customerstateForm: FormGroup;
  submitted = false;
  title = '';
  sub: any;
  stategstArr: Array<any> = []; // List of state gst
  customerStateArr: Array<any> = []; // List of customer state
  // stateCityArr: Array<any> = []; // List of state's city
  isDisabled = false;
  custid = 0;
  accessArr: Array<any> = []; // List of menuaccess
  gstPrefix = '';
  customerPan = '';
  stateCode = '00';
  loading = false;

  @Input() CustStId: number;

  constructor(private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private _router: Router,
    private airlineService: AirlineService,
    private custservice: CustomerService,
    private _auth: AuthenticationService,
    private commservice: CommonService,
    private accservice: AccountsService,
    private commonfunction: CommonFunction,
    private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.custid = this._auth.getCustId();
    this.getStateGstData();

    if (this.CustStId === 0 || this.CustStId === undefined) {
      this.getCustomerAdminUserData(this.custid);
    }

    this.customerstateForm = this.formBuilder.group({
      StateCode: ['', [Validators.required]],
      GSTNo: ['', [Validators.required, GSTLast3DigitValidator]],
      EmailId: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$')]],
      PhoneNo: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      PinCode: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      CityName: ['', [Validators.required]],
      Address: [''],
      CustStId: [0],
      userId: ['00000000-0000-0000-0000-000000000000'],
    }, {
      validator: [
        this.commonfunction.UniqueCheck('StateCode', 'CS', 'CustStId', this.custid.toString()),
        // this.commonfunction.UniqueEmailCheck('EmailId', 'userId'),
      ],
    });

    this.sub = this.route.params.subscribe(params => {
      const id = this._auth.decryptData(params['custStId']) || 0;
      this.CustStId = id['custStId'] || 0;
      this.title = ((this.CustStId !== undefined && this.CustStId > 0) ? 'Edit' : 'Create') + ' - Customer State';

      this.accservice.getGetUserActions(this._auth.getUserId()).subscribe(
        (data) => {
          if (data['message'] === 'Success') {
            this.accessArr = data['payload'];
            if (this.accessArr.filter(t => t.actionName === (this.CustStId > 0 ? 'Update' : 'Create')
              && t.module === 'Customer State').length > 0) {
              this.getCustomerStateData(this.CustStId);
            } else {
              const message = '401 Unauthorized page: ' + this.title;
              this.commonfunction.ErrorLogHdlFunc(message, this._auth.getUserId());
              this._router.navigate(['unauthorized']);
            }

          }
        });

    });

    // to get the customer PAN No
    if (this.CustStId === 0) {
      this.custservice.getCustomerMasterList(this.custid, false).subscribe(
        (data) => {
          if (data['message'] === 'Success') {
            const cutomerDetail = data['payload'];
            if (cutomerDetail.length > 0) {
              this.customerPan = cutomerDetail[0].panNo;
              this.gstPrefix = this.stateCode + this.customerPan;
            }
          }
        });
    }

  }

  get f() { return this.customerstateForm.controls; }

  onSubmit() {
    this.submitted = true;
    if (this.customerstateForm.valid) {
      this.isDisabled = true;
      this.loading = true;
      const objCust: CustomerStateMaster = new CustomerStateMaster();
      objCust.CreatedBy = this._auth.getUserId();
      objCust.CustStId = this.customerstateForm.controls['CustStId'].value;
      objCust.CustId = this.custid;
      objCust.StateCode = this.sanitizer.sanitize(SecurityContext.HTML,
        this.customerstateForm.controls['StateCode'].value);

      objCust.GSTNo = this.stateCode + this.customerPan + this.sanitizer.sanitize(SecurityContext.HTML,
        this.customerstateForm.controls['GSTNo'].value);
      objCust.Address = this.sanitizer.sanitize(SecurityContext.HTML,
        this.customerstateForm.controls['Address'].value);
      objCust.EmailId = this.sanitizer.sanitize(SecurityContext.HTML,
        this.customerstateForm.controls['EmailId'].value);
      objCust.PhoneNo = this.sanitizer.sanitize(SecurityContext.HTML,
        this.customerstateForm.controls['PhoneNo'].value);
      objCust.CityName = this.sanitizer.sanitize(SecurityContext.HTML,
        this.customerstateForm.controls['CityName'].value);
      objCust.PinCode = this.sanitizer.sanitize(SecurityContext.HTML,
        this.customerstateForm.controls['PinCode'].value);

      this.custservice.customerStateMasterPost(objCust).subscribe(
        (data) => {
          if (data['isError'] === false && data['code'] === 200) {
            this.commonfunction.showToast('success', 'Success', 'Successfully saved');

            const objULog: UserLog = new UserLog();
            objULog.Action = (this.CustStId > 0 ? 'Edit' : 'Create') + ' Customer State';
            objULog.UserId = this._auth.getUserId();
            objULog.PageName = objULog.PageName = (this.CustStId > 0 ? 'customerStateEdit' : 'customerStateCreate');
            objULog.Notes = 'CustStId=' + this.CustStId;

            this.commservice.insertUserLog(objULog).subscribe(data3 => {
              // do something, success
            }, error => { alert(error); });


            setTimeout(() => {
              this._router.navigate(['customerStateList']);
            }, 1500);
          } else {
            this.commonfunction.showToast('danger', 'Failed', 'Not saved');
            this.isDisabled = false;
          }
          this.loading = false;
        },
      );
    }
  }

  onReset() {
    this.submitted = false;
    if (this.CustStId > 0) {
      this.getCustomerStateData(this.CustStId);
    } else {
      this.customerstateForm.get('StateCode').setValue('');
      this.customerstateForm.get('CityName').setValue('');
      this.customerstateForm.get('GSTNo').setValue('');
      this.customerstateForm.get('EmailId').setValue('');
      this.customerstateForm.get('PhoneNo').setValue('');
      this.customerstateForm.get('PinCode').setValue('');
      this.customerstateForm.get('Address').setValue('');
    }
  }

  onList(): void {
    this._router.navigate(['customerStateList']);
  }

  // Get State GST list
  getStateGstData() {
    this.airlineService.getStateGSTList('').subscribe(
      (data) => {
        if (data['isError'] === false && data['code'] === 200) {
          this.stategstArr = data['payload'];
        } else {
          this.stategstArr = [];
        }
      },
    );
  }

  getCustomerAdminUserData(custid: number) {
    this.custservice.getCustomerUserMasterList(0, custid, '00000000-0000-0000-0000-000000000000').subscribe(
      (data) => {
        if (data['isError'] === false && data['code'] === 200) {
          const AdminData = [];
          AdminData.push(data['payload'].filter(x => x.roleName === 'Customer Admin')[0]);
          this.customerstateForm.get('EmailId').setValue(AdminData[0].email);
          this.customerstateForm.get('PhoneNo').setValue(AdminData[0].contactNo);
        }
      },
    );
  }
  // Get city list
  // getCitiesDDLData(sid, cId) {
  //   this.airlineService.getCitiesList(sid).subscribe(
  //     (data) => {
  //       if (data['isError'] === false && data['code'] === 200) {
  //         this.stateCityArr = data['payload'];

  //         if (cId === '0') {
  //           cId = '';
  //         }
  //         setTimeout(() => {
  //           this.customerstateForm.get('CityId').setValue(cId);
  //         }, 100);

  //       } else {
  //         this.stateCityArr = [];
  //       }
  //     },
  //   );
  // }
  // Get Customer StateMaster Data
  getCustomerStateData(custstId = 0, custid = 0) {
    this.custservice.getCustomerStateMasterList(custstId, custid).subscribe(
      (data) => {
        if (data['isError'] === false && data['code'] === 200) {
          this.customerStateArr = data['payload'];
        } else {
          this.customerStateArr = [];
        }
        // Set values
        if (custstId > 0) {
          // this.getCitiesDDLData(this.customerStateArr.map(t => t.stateCode)[0],
          //   this.customerStateArr.map(t => t.cityId)[0].toString());
          this.customerstateForm.get('CityName').setValue(this.customerStateArr.map(t => t.CityName)[0]);
          this.customerstateForm.get('CustStId').setValue(this.customerStateArr.map(t => t.custStId)[0]);
          this.customerstateForm.get('StateCode').setValue(this.customerStateArr.map(t => t.stateCode)[0]);
          const gstNo = this.customerStateArr.map(t => t.gstNo)[0];
          this.stateCode = gstNo.slice(0, 2);
          this.customerPan = gstNo.slice(2, 12);
          this.gstPrefix = this.stateCode + this.customerPan;
          this.customerstateForm.get('GSTNo').setValue(gstNo.slice(12, 15));
          this.customerstateForm.get('EmailId').setValue(this.customerStateArr.map(t => t.emailId)[0]);
          this.customerstateForm.get('PhoneNo').setValue(this.customerStateArr.map(t => t.phoneNo)[0]);
          this.customerstateForm.get('PinCode').setValue(this.customerStateArr.map(t => t.pinCode)[0]);
          this.customerstateForm.get('Address').setValue(this.customerStateArr.map(t => t.address)[0]);
        }
      },
    );
  }

  changeState(selectedVal: string) {
    // this.getCitiesDDLData(selectedVal, '');
    this.stateCode = selectedVal;
    this.gstPrefix = this.stateCode + this.customerPan;
  }


}
