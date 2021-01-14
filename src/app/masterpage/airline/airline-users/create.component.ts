import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit, Input, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { AccountsService } from '../../../services/accounts.service';
import { AirlineService } from '../../../services/airline.service';
import { CommonFunction } from '../../../common/common-functions';
import { AirlineUsersRM, AirlineUsers, AirlineUserLinkRM } from '../../../models/airlines-model';
import { AuthenticationService } from '../../../services/authentication.service';
import { UserLog } from '../../../models/common-model';
import { CommonService } from '../../../services/common.service';
import { Validation } from '../../../common/validation';

@Component({
  selector: 'ngx-create-user-airline',
  templateUrl: './create.component.html',
})
export class UserCreateComponent implements OnInit {
  airlineuserForm: FormGroup;
  submitted = false;
  title = '';
  sub: any;
  stategstArr: Array<any> = []; // List of state gst
  roleArr: Array<any> = []; // List of state gst
  airlineUserArr: Array<any> = []; // List of airline state
  isDisabled = false;
  isCodeDisabled = false;
  airid = 0;
  statesSelected = [];
  DefstatesSelected = [];
  optionRoleVal = '';
  passwordHint = '';
  AirCode = '';
  accessArr: Array<any> = []; // List of menuaccess
  stateNameArray: Array<string> = [];
  roleNameText = '';
  loading = false;
  @Input() AirUserId: number = 0;
  @Input() fromprofilepage: number = 0;

  constructor(private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private _router: Router,
    private airlineService: AirlineService,
    private _auth: AuthenticationService,
    private commservice: CommonService,
    private commonfunction: CommonFunction,
    private validation: Validation,
    private accservice: AccountsService,
    private sanitizer: DomSanitizer) { }


  ngOnInit() {
    this.airid = this._auth.getAirlineId();

    if (this.fromprofilepage === 1) {

      this.getRoleData(this.airid);
      this.getAirlineData(this.airid);
      setTimeout(() => {
        this.getAirlineUserData(0, 0, this._auth.getUserId());
        setTimeout(() => {
          this.getAirlineStateUserData(Number(this.AirUserId), this.airid);
        }, 300);
      }, 200);


    } else {
      this.sub = this.route.params.subscribe(params => {
        const id = this._auth.decryptData(params['airUserId']) || 0;
        this.AirUserId = id['airUserId'] || 0;
        this.title = ((this.AirUserId !== undefined && this.AirUserId > 0) ? 'Edit' : 'Create') + ' - Airline User';
        this.accservice.getGetUserActions(this._auth.getUserId()).subscribe(
          (data) => {
            if (data['message'] === 'Success') {
              this.accessArr = data['payload'];
              if (this.accessArr.filter(t => t.actionName === (this.AirUserId > 0 ? 'Update' : 'Create')
                && t.module === 'Airline Users').length > 0) {
                this.getRoleData(this.airid);
                this.getAirlineData(this.airid);
                setTimeout(() => {
                  this.getAirlineUserData(this.AirUserId);
                  setTimeout(() => {
                    this.getAirlineStateUserData(Number(this.AirUserId), this.airid);
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





    this.airlineuserForm = this.formBuilder.group({
      Name: ['', [Validators.required]],
      ContactNo: ['', [Validators.required, Validators.pattern('^[0-9]*$'),
      this.validation.IsContactNoExist]],
      Role: ['', [Validators.required]],
      Email: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$')]],
      // Email: ['', ((this.AirUserId === 0 || this.fromprofilepage === 1) ?
      //   [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$')] : '')],
      UserName: ['', (this.AirUserId === 0 ?
        [Validators.required, Validators.pattern('^[a-zA-Z0-9_-]{5,15}$')] : '')],
      Password: ['', ((this.AirUserId === 0 && this.fromprofilepage === 0) ? [Validators.required,
      Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{8,}')] :
        '')],
      RoleName: [''],
      AirStId: [[]],
      UserId: [''],
      IsResetPassword: [false],
      Code: [''],
      AirUserId: [0],
    }, {
      validator: [
        this.commonfunction.UniqueEmailCheck('Email', 'UserId'),
        this.commonfunction.UniqueUserNameCheck('AirUserId', Number(this.airid), 'Code', 'UserName', 'A'),
        this.validation.IsContactNoExist('ContactNo', 'UserId'),
      ],
    },
    );


  }

  get f() { return this.airlineuserForm.controls; }

  onSubmit() {
    this.submitted = true;
    if (this.airlineuserForm.valid) {
      this.loading = true;
      this.isDisabled = true;
      this.airid = this._auth.getAirlineId();
      const objAirlineUsersRM: AirlineUsersRM = new AirlineUsersRM();

      const objAirlineUsers: AirlineUsers = new AirlineUsers();
      objAirlineUsers.CreatedBy = this._auth.getUserId();
      objAirlineUsers.AirUserId = this.airlineuserForm.controls['AirUserId'].value;
      objAirlineUsers.AirlineId = this.airid;
      objAirlineUsers.UserId = (this.airlineuserForm.controls['UserId'].value !== '' ?
        this.airlineuserForm.controls['UserId'].value :
        '00000000-0000-0000-0000-000000000000');
      objAirlineUsers.Name = this.sanitizer.sanitize(SecurityContext.HTML,
        this.airlineuserForm.controls['Name'].value);
      objAirlineUsers.ContactNo = this.sanitizer.sanitize(SecurityContext.HTML,
        this.airlineuserForm.controls['ContactNo'].value);
      objAirlineUsers.IsResetPassword = this.airlineuserForm.controls['IsResetPassword'].value;

      const objAirlineUserLinkList: Array<AirlineUserLinkRM> = new Array<AirlineUserLinkRM>();

      this.statesSelected.forEach(function (value) {
        const objAirlineUsersLink: AirlineUserLinkRM = new AirlineUserLinkRM();
        objAirlineUsersLink.LinkId = 0;
        objAirlineUsersLink.AirStId = value;
        objAirlineUserLinkList.push(objAirlineUsersLink);
      });

      objAirlineUsersRM.airlineUsers = objAirlineUsers;
      objAirlineUsersRM.airlineUserLink_RMs = objAirlineUserLinkList;


      this.airlineService.AirlineUsersPost(objAirlineUsersRM,
        this.sanitizer.sanitize(SecurityContext.HTML, this.airlineuserForm.controls['Email'].value),
        this.sanitizer.sanitize(SecurityContext.HTML,
          this.AirCode + '_' + this.airlineuserForm.controls['UserName'].value),
        this.sanitizer.sanitize(SecurityContext.HTML, this.airlineuserForm.controls['Password'].value),
        (this.airlineuserForm.controls['Role'].value === '0' ?
          this.sanitizer.sanitize(SecurityContext.HTML,
            this.airlineuserForm.controls['RoleName'].value) :
          this.airlineuserForm.controls['Role'].value),
      ).subscribe(
        (data) => {
          if (data['isError'] === false && data['code'] === 200) {
            this.commonfunction.showToast('success', 'Success', 'Successfully saved');

            const objULog: UserLog = new UserLog();
            objULog.Action = (this.AirUserId > 0 ? 'Edit' : 'Create') + ' Airline User';
            objULog.UserId = this._auth.getUserId();
            objULog.PageName = objULog.PageName = (
              this.AirUserId > 0 ? 'airlineUserEdit' : 'airlineUserCreate'
            );
            objULog.Notes = 'AirUserId=' + this.AirUserId;

            this.commservice.insertUserLog(objULog).subscribe(data3 => {
              // do something, success
            }, error => { alert(error); });
            setTimeout(() => {

              if (this.fromprofilepage === 1) {
                this.isDisabled = false;
                // this._router.navigate(['myprofile']);
              } else {
                this._router.navigate(['airlineUserList']);
              }
            }, 1500);
          } else {
            this.commonfunction.showToast('danger', 'Failed', 'Not saved');
            this.isDisabled = false;
            this.loading = false;
          }
        },
      );
    }
  }

  // On role change
  onRoleChange() {
    const value = this.optionRoleVal;
    if (value === '0') {
      this.airlineuserForm.get('RoleName').setValidators([Validators.required]);
      this.airlineuserForm.get('RoleName').updateValueAndValidity();
    } else {
      this.airlineuserForm.get('RoleName').clearValidators();
      this.airlineuserForm.get('RoleName').updateValueAndValidity();
    }
  }

  onReset() {
    this.submitted = false;
    // this.airid = this._auth.getAirlineId();
    // this.getAirlineStateUserData(Number(this.AirUserId), this.airid);
    this.statesSelected = this.DefstatesSelected;
    if (this.AirUserId > 0) {
      this.getAirlineUserData(this.AirUserId, this.airid);
      this.airlineuserForm.get('RoleName').setValue('');
      this.isCodeDisabled = true;
    } else {
      this.airlineuserForm.get('Name').setValue('');
      this.airlineuserForm.get('ContactNo').setValue('');
      this.airlineuserForm.get('Role').setValue('');
      this.airlineuserForm.get('RoleName').setValue('');
      this.airlineuserForm.get('Email').setValue('');
      this.airlineuserForm.get('UserName').setValue('');
      this.airlineuserForm.get('Password').setValue('');
      this.airlineuserForm.get('IsResetPassword').setValue(false);
    }
  }

  onList(): void {
    this._router.navigate(['airlineUserList']);
  }

  // Get State User Link
  getAirlineStateUserData(airuserid = 0, airId = 0) {
    this.statesSelected = [];
    this.DefstatesSelected = [];
    this.airlineService.getAirlineStateUserLink(airuserid, airId).subscribe(
      (data) => {
        if (data['isError'] === false && data['code'] === 200) {
          this.stategstArr = data['payload'];
        } else {
          this.stategstArr = [];
        }

        if (airuserid > 0 && this.roleNameText !== 'Airline Admin') {
          for (const [key] of Object.entries(this.stategstArr)) {
            if (this.stategstArr[key]['linkId'] > 0) {
              this.statesSelected.push(this.stategstArr[key]['airStId']);
              this.DefstatesSelected.push(this.stategstArr[key]['airStId']);
              this.stateNameArray.push(this.stategstArr[key]['stateName']);
            }
          }
        } else {

          for (const [key] of Object.entries(this.stategstArr)) {
            this.statesSelected.push(this.stategstArr[key]['airStId']);
            this.DefstatesSelected.push(this.stategstArr[key]['airStId']);
            this.stateNameArray.push(this.stategstArr[key]['stateName']);
          }
        }
      },
    );
  }

  // Get Roles
  getRoleData(airId = 0) {
    this.accservice.getRolesList('', airId, 0).subscribe(
      (data) => {
        if (data['isError'] === false && data['code'] === 200) {
          this.roleArr = data['payload'];
        } else {
          this.roleArr = [];
        }
      },
    );
  }

  // Get Airline User Data
  getAirlineUserData(airuserId = 0, airlineid = 0, userid = '00000000-0000-0000-0000-000000000000') {
    this.airlineService.getAirlineUserMasterList(airuserId, airlineid, userid).subscribe(
      (data) => {
        if (data['isError'] === false && data['code'] === 200) {
          this.airlineUserArr = data['payload'];
        } else {
          this.airlineUserArr = [];
        }

        if (this.fromprofilepage === 1) {
          airuserId = this.airlineUserArr.map(t => t.airUserId)[0];
          this.AirUserId = this.airlineUserArr.map(t => t.airUserId)[0];
          this.airlineuserForm.get('Email').setValue(this.airlineUserArr.map(t => t.email)[0]);
        }
        // Set values
        if (airuserId > 0) {
          this.airlineuserForm.get('AirUserId').setValue(this.airlineUserArr.map(t => t.airUserId)[0]);
          this.airlineuserForm.get('UserId').setValue(this.airlineUserArr.map(t => t.userId)[0]);
          this.airlineuserForm.get('Name').setValue(this.airlineUserArr.map(t => t.name)[0]);
          this.airlineuserForm.get('ContactNo').setValue(this.airlineUserArr.map(t => t.contactNo)[0]);
          this.airlineuserForm.get('Role').setValue(this.airlineUserArr.map(t => t.roleName)[0]);
          const username = this.airlineUserArr.map(t => t.userName)[0].replace(this.AirCode + '_', '');
          this.airlineuserForm.get('UserName').setValue(username);
          this.airlineuserForm.get('IsResetPassword').setValue(this.airlineUserArr.map(t => t.isResetPassword)[0]);
          this.airlineuserForm.get('Email').setValue(this.airlineUserArr.map(t => t.email)[0]);
          this.isCodeDisabled = true;
          this.roleNameText = this.airlineUserArr.map(t => t.roleName)[0];

          // if (this.roleNameText === 'Airline Admin') {
          //   for (const [key] of Object.entries(this.stategstArr)) {
          //     this.stateNameArray.push(this.stategstArr[key]['stateName']);
          //   }
          // }
        }
      },
    );
  }

  // Get Airline Master Data
  getAirlineData(airlineid = 0) {
    this.airlineService.getAirlineMasterList(airlineid).subscribe(
      (data) => {
        if (data['isError'] === false && data['code'] === 200) {
          this.AirCode = data['payload'][0]['digit3Code'];
        } else {
          this.AirCode = '';
        }
        this.airlineuserForm.get('Code').setValue(this.AirCode);
      },
    );
  }

  selectedStates(states: any) {
    this.stateNameArray = [];
    if (states.length > 0) {
      for (let i = 0; i < states.length; i++) {
        const stateName = this.stategstArr.filter(t => t.airStId === states[i])[0]['stateName'];
        this.stateNameArray.push(stateName);
      }
    }
  }
}
