import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit, Input, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { AccountsService } from '../../../services/accounts.service';
import { CustomerService } from '../../../services/customer.service';
import { CommonFunction } from '../../../common/common-functions';
import { CustomerUsersRM, CustomerUsers, CustomerUserLinkRM } from '../../../models/customer-model';
import { AuthenticationService } from '../../../services/authentication.service';
import { UserLog } from '../../../models/common-model';
import { CommonService } from '../../../services/common.service';
import { Validation } from '../../../common/validation';


@Component({
  selector: 'ngx-create-user-customer',
  templateUrl: './create.component.html',
})
export class CUserCreateComponent implements OnInit {
  customeruserForm: FormGroup;
  submitted = false;
  title = '';
  sub: any;
  stategstArr: Array<any> = []; // List of state gst
  roleArr: Array<any> = []; // List of state gst
  customerUserArr: Array<any> = []; // List of customer state
  isDisabled = false;
  isCodeDisabled = false;
  custid = 0;
  statesSelected = [];
  DefstatesSelected = [];
  optionRoleVal = '';
  custCode = '';
  passwordHint = '';
  userNameHint = '';
  accessArr: Array<any> = []; // List of menuaccess
  stateNameArray: Array<string> = [];
  roleNameText = '';
  loading = false;
  @Input() CustUserId: number = 0;
  @Input() fromprofilepage: number = 0;

  constructor(private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private _router: Router,
    private accservice: AccountsService,
    private custservice: CustomerService,
    private _auth: AuthenticationService,
    private commservice: CommonService,
    private commonfunction: CommonFunction,
    private validation: Validation,
    private sanitizer: DomSanitizer) { }
  ngOnInit() {
    this.custid = this._auth.getCustId();
    if (this.fromprofilepage === 1) {
      this.getRoleData(this.custid);
      this.getCustomerData(this.custid);

      setTimeout(() => {
        this.getCustomerUserData(0, 0, this._auth.getUserId());
        setTimeout(() => {
          this.getCustomerStateUserData(Number(this.CustUserId), this.custid);
        }, 300);
      }, 200);


    } else {
      this.sub = this.route.params.subscribe(params => {
        const id = this._auth.decryptData(params['custUserId']) || 0;
        this.CustUserId = id['custUserId'] || 0;
        this.title = ((this.CustUserId !== undefined && this.CustUserId > 0) ? 'Edit' : 'Create') + ' - Customer User';

        this.accservice.getGetUserActions(this._auth.getUserId()).subscribe(
          (data) => {
            if (data['message'] === 'Success') {
              this.accessArr = data['payload'];
              if (this.accessArr.filter(t => t.actionName === (this.CustUserId > 0 ? 'Update' : 'Create')
                && t.module === 'Customer Request').length > 0) {
                this.getRoleData(this.custid);
                this.getCustomerData(this.custid);
                setTimeout(() => {
                  this.getCustomerUserData(this.CustUserId);
                  setTimeout(() => {
                    this.getCustomerStateUserData(Number(this.CustUserId), this.custid);
                  }, 300);
                }, 200);

              } else {
                const message = '401 Unauthorized page: ' + this.title;
                this.commonfunction.ErrorLogHdlFunc(message, this._auth.getUserId());
                this._router.navigate(['unauthorized']);
              }

            }
          });


      });

    }


    this.customeruserForm = this.formBuilder.group({
      Name: ['', [Validators.required]],
      ContactNo: ['', [Validators.required, Validators.pattern('^[0-9]*$'),
      this.validation.IsContactNoExist]],
      Role: ['', [Validators.required]],
      Email: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$')]],
      // Email: ['', (this.CustUserId === 0 ?
      //   [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$')] : '')],
      UserName: ['', (this.CustUserId === 0 ?
        [Validators.required, Validators.pattern('^[a-zA-Z0-9_-]{5,10}$')] : '')],
      // Password: ['', (this.CustUserId === 0 ? [Validators.required,
      Password: ['', ((this.CustUserId === 0 && this.fromprofilepage === 0) ? [Validators.required,
      Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{8,}')] :
        '')],
      RoleName: [''],
      CustStId: [[]],
      UserId: [''],
      IsResetPassword: [false],
      CustUserId: [0],
      CustCode: [''],
    }, {
        validator: [
          this.commonfunction.UniqueEmailCheck('Email', 'UserId'),
          this.commonfunction.UniqueUserNameCheck('CustUserId', Number(this.custid), 'CustCode', 'UserName', 'C'),
          this.commonfunction.EmailDomainCheck('Email', this.custid),
          this.validation.IsContactNoExist('ContactNo', 'UserId'),
        ],
      });


  }

  get f() { return this.customeruserForm.controls; }

  onSubmit() {
    this.submitted = true;
    if (this.customeruserForm.valid) {
      this.isDisabled = true;
      this.loading = true;
      this.custid = this._auth.getCustId();
      const objCustomerUsersRM: CustomerUsersRM = new CustomerUsersRM();

      const objCustomerUsers: CustomerUsers = new CustomerUsers();
      objCustomerUsers.CreatedBy = this._auth.getUserId();
      objCustomerUsers.CustUserId = this.customeruserForm.controls['CustUserId'].value;
      objCustomerUsers.CustId = this.custid;
      objCustomerUsers.UserId = (this.customeruserForm.controls['UserId'].value !== '' ?
        this.customeruserForm.controls['UserId'].value :
        '00000000-0000-0000-0000-000000000000');
      objCustomerUsers.Name = this.sanitizer.sanitize(SecurityContext.HTML,
        this.customeruserForm.controls['Name'].value);
      objCustomerUsers.ContactNo = this.sanitizer.sanitize(SecurityContext.HTML,
        this.customeruserForm.controls['ContactNo'].value);
      objCustomerUsers.IsResetPassword = this.customeruserForm.controls['IsResetPassword'].value;

      const objCustomerUserLinkList: Array<CustomerUserLinkRM> = new Array<CustomerUserLinkRM>();

      this.statesSelected.forEach(function (value) {
        const objCustomerUsersLink: CustomerUserLinkRM = new CustomerUserLinkRM();
        objCustomerUsersLink.LinkId = 0;
        objCustomerUsersLink.CustStId = value;
        objCustomerUserLinkList.push(objCustomerUsersLink);
      });

      objCustomerUsersRM.customerUsers = objCustomerUsers;
      objCustomerUsersRM.customerUserLink_RMs = objCustomerUserLinkList;

      this.custservice.customerUsersPost(objCustomerUsersRM,
        this.sanitizer.sanitize(SecurityContext.HTML,
          this.customeruserForm.controls['Email'].value),
        this.sanitizer.sanitize(SecurityContext.HTML,
          this.custCode + '_' + this.customeruserForm.controls['UserName'].value),
        this.sanitizer.sanitize(SecurityContext.HTML,
          this.customeruserForm.controls['Password'].value),
        (this.customeruserForm.controls['Role'].value === '0' ?
          this.sanitizer.sanitize(SecurityContext.HTML,
            this.customeruserForm.controls['RoleName'].value) :
          this.customeruserForm.controls['Role'].value),
      ).subscribe(
        (data) => {
          if (data['isError'] === false && data['code'] === 200) {
            this.commonfunction.showToast('success', 'Success', 'Successfully saved');

            const objULog: UserLog = new UserLog();
            objULog.Action = (this.CustUserId > 0 ? 'Edit' : 'Create') + ' Customer User';
            objULog.UserId = this._auth.getUserId();
            objULog.PageName = (this.CustUserId > 0 ? 'customerUserEdit' : 'customerUserCreate');
            objULog.Notes = 'CustUserId=' + this.CustUserId;

            this.commservice.insertUserLog(objULog).subscribe(data3 => {
              // do something, success
            }, error => { alert(error); });

            setTimeout(() => {

              if (this.fromprofilepage === 1) {
                this.isDisabled = false;
              } else {
                this._router.navigate(['customerUserList']);
              }


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

  // On role change
  onRoleChange() {
    const value = this.optionRoleVal;
    if (value === '0') {
      this.customeruserForm.get('RoleName').setValidators([Validators.required]);
      this.customeruserForm.get('RoleName').updateValueAndValidity();
    } else {
      this.customeruserForm.get('RoleName').clearValidators();
      this.customeruserForm.get('RoleName').updateValueAndValidity();
    }
  }

  onReset() {
    this.submitted = false;
    // this.custid = this._auth.getCustomerId();
    // this.getCustomerStateUserData(Number(this.CustUserId), this.custid);
    this.statesSelected = this.DefstatesSelected;
    if (this.CustUserId > 0) {
      this.getCustomerUserData(this.CustUserId, this.custid);
      this.customeruserForm.get('RoleName').setValue('');
      this.isCodeDisabled = true;
    } else {
      this.customeruserForm.get('Name').setValue('');
      this.customeruserForm.get('ContactNo').setValue('');
      this.customeruserForm.get('Role').setValue('');
      this.customeruserForm.get('RoleName').setValue('');
      this.customeruserForm.get('Email').setValue('');
      this.customeruserForm.get('UserName').setValue('');
      this.customeruserForm.get('Password').setValue('');
      this.customeruserForm.get('IsResetPassword').setValue(false);
      this.customeruserForm.get('CustCode').setValue(this.custCode);
    }
  }

  onList(): void {
    this._router.navigate(['customerUserList']);
  }

  // Get State User Link
  getCustomerStateUserData(custuserid = 0, custid = 0) {
    this.statesSelected = [];
    this.DefstatesSelected = [];
    this.custservice.getCustomerStateUserLink(custuserid, custid).subscribe(
      (data) => {
        if (data['isError'] === false && data['code'] === 200) {
          this.stategstArr = data['payload'];
        } else {
          this.stategstArr = [];
        }
        if (custuserid > 0 && this.roleNameText !== 'Customer Admin') {
          for (const [key] of Object.entries(this.stategstArr)) {
            if (this.stategstArr[key]['linkId'] > 0) {
              this.statesSelected.push(this.stategstArr[key]['custStId']);
              this.DefstatesSelected.push(this.stategstArr[key]['custStId']);
              this.stateNameArray.push(this.stategstArr[key]['stateName']);
            }
          }
        } else {
          for (const [key] of Object.entries(this.stategstArr)) {
            this.statesSelected.push(this.stategstArr[key]['custStId']);
            this.DefstatesSelected.push(this.stategstArr[key]['custStId']);
            this.stateNameArray.push(this.stategstArr[key]['stateName']);
          }
        }
      },
    );
  }

  // Get Roles
  getRoleData(custid = 0) {
    this.accservice.getRolesList('', 0, custid).subscribe(
      (data) => {
        if (data['isError'] === false && data['code'] === 200) {
          this.roleArr = data['payload'];
        } else {
          this.roleArr = [];
        }
      },
    );
  }


  getCustomerData(custid = 0) {
    this.custservice.getCustomerMasterList(custid, false).subscribe(
      (data) => {
        if (data['isError'] === false && data['code'] === 200) {
          this.custCode = data['payload'][0].custCode;
        } else {
          this.custCode = '';
        }
        this.customeruserForm.get('CustCode').setValue(this.custCode);
      },
    );
  }

  // Get Customer User Data
  getCustomerUserData(custuserid = 0, custid = 0, userid = '00000000-0000-0000-0000-000000000000') {
    this.custservice.getCustomerUserMasterList(custuserid, custid, userid).subscribe(
      (data) => {
        if (data['isError'] === false && data['code'] === 200) {
          this.customerUserArr = data['payload'];
        } else {
          this.customerUserArr = [];
        }
        if (this.fromprofilepage === 1) {
          custuserid = this.customerUserArr.map(t => t.custUserId)[0];
          this.CustUserId = this.customerUserArr.map(t => t.custUserId)[0];
          this.customeruserForm.get('Email').setValue(this.customerUserArr.map(t => t.email)[0]);
        }

        // Set values
        if (custuserid > 0) {
          this.customeruserForm.get('CustUserId').setValue(this.customerUserArr.map(t => t.custUserId)[0]);
          this.customeruserForm.get('UserId').setValue(this.customerUserArr.map(t => t.userId)[0]);
          this.customeruserForm.get('Name').setValue(this.customerUserArr.map(t => t.name)[0]);
          this.customeruserForm.get('ContactNo').setValue(this.customerUserArr.map(t => t.contactNo)[0]);
          this.customeruserForm.get('Role').setValue(this.customerUserArr.map(t => t.roleName)[0]);
          const username = this.customerUserArr.map(t => t.userName)[0].replace(this.custCode + '_', '');
          this.customeruserForm.get('UserName').setValue(username);
          this.customeruserForm.get('IsResetPassword').setValue(this.customerUserArr.map(t => t.isResetPassword)[0]);
          this.customeruserForm.get('Email').setValue(this.customerUserArr.map(t => t.email)[0]);
          this.isCodeDisabled = true;
          this.roleNameText = this.customerUserArr.map(t => t.roleName)[0];

          // if (this.roleNameText === 'Customer Admin') {
          //   for (const [key] of Object.entries(this.stategstArr)) {
          //     this.stateNameArray.push(this.stategstArr[key]['stateName']);
          //   }
          // }
        }
        // this.customeruserForm.get('CustCode').setValue(this.custCode);

      },
    );
  }

  selectedStates(states: any) {
    this.stateNameArray = [];
    if (states.length > 0) {
      for (let i = 0; i < states.length; i++) {
        const stateName = this.stategstArr.filter(t => t.custStId === states[i])[0]['stateName'];
        this.stateNameArray.push(stateName);
      }
    }
  }

}
