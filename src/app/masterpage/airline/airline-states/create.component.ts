import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit, Input, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { AirlineService } from '../../../services/airline.service';
import { CommonFunction } from '../../../common/common-functions';
import { AirlineStateMaster } from '../../../models/airlines-model';
import { AuthenticationService } from '../../../services/authentication.service';
import { UserLog } from '../../../models/common-model';
import { CommonService } from '../../../services/common.service';
import { AccountsService } from '../../../services/accounts.service';
import { GSTLast3DigitValidator } from '../../../common/validation';

@Component({
  selector: 'ngx-create-state-airline',
  templateUrl: './create.component.html',
})
export class StateCreateComponent implements OnInit {
  airlinestateForm: FormGroup;
  submitted = false;
  title = '';
  sub: any;
  stategstArr: Array<any> = []; // List of state gst
  airlineStateArr: Array<any> = []; // List of airline state
  // stateCityArr: Array<any> = []; // List of state's city
  isDisabled = false;
  airid = 0;
  accessArr: Array<any> = []; // List of menuaccess
  gstPrefix = '';
  airlinePan = '';
  stateCode = '00';
  loading = false;
  @Input() AirStId: number;

  constructor(private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private _router: Router,
    private airlineService: AirlineService,
    private _auth: AuthenticationService,
    private commservice: CommonService,
    private accservice: AccountsService,
    private commonfunction: CommonFunction,
    private sanitizer: DomSanitizer) { }
  ngOnInit() {
    this.airid = this._auth.getAirlineId();
    this.getStateGstData();
    if (this.AirStId === 0 || this.AirStId === undefined) {
      this.getAirlineAdminUserData(this.airid);
    }
    this.airlinestateForm = this.formBuilder.group({
      StateCode: ['', [Validators.required]],
      GSTNo: ['', [Validators.required, GSTLast3DigitValidator]],
      EmailId: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$')]],
      PhoneNo: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      Address: [''],
      AirlineId: [this.airid],
      AirStId: [0],
      PinCode: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      CityName: ['', [Validators.required]],
    }, {
      validator: [
        this.commonfunction.UniqueCheck('StateCode', 'AS', 'AirStId', this.airid.toString()),
      ],
    });

    this.sub = this.route.params.subscribe(params => {
      const id = this._auth.decryptData(params['airStId']) || 0;
      this.AirStId = id['airStId'] || 0;
      this.title = ((this.AirStId !== undefined && this.AirStId > 0) ? 'Edit' : 'Create') + ' - Airline State';

      this.accservice.getGetUserActions(this._auth.getUserId()).subscribe(
        (data) => {
          if (data['message'] === 'Success') {
            this.accessArr = data['payload'];
            if (this.accessArr.filter(t => t.actionName === (this.AirStId > 0 ? 'Update' : 'Create')
              && t.module === 'Airline State').length > 0) {
              this.getAirlineStateData(this.AirStId);
            } else {
              const message = '401 Unauthorized page: ' + this.title;
              this.commonfunction.ErrorLogHdlFunc(message, this._auth.getUserId());
              this._router.navigate(['unauthorized']);
            }

          }
        });
    });

    // to get the airline PAN No
    if (this.AirStId === 0) {
      this.airlineService.getAirlineMasterList(this.airid).subscribe(
        (data) => {
          if (data['message'] === 'Success') {
            const airlineDetail = data['payload'];
            if (airlineDetail.length > 0) {
              this.airlinePan = airlineDetail[0].panNo;
              this.gstPrefix = this.stateCode + this.airlinePan;
            }
          }
        });
    }
  }

  get f() { return this.airlinestateForm.controls; }

  onSubmit() {
    this.submitted = true;
    if (this.airlinestateForm.valid) {
      this.loading = true;
      this.isDisabled = true;
      this.airid = this._auth.getAirlineId();
      const objAirline: AirlineStateMaster = new AirlineStateMaster();
      objAirline.CreatedBy = this._auth.getUserId();
      objAirline.AirStId = this.airlinestateForm.controls['AirStId'].value;
      objAirline.AirlineId = this.airid;
      objAirline.StateCode = this.sanitizer.sanitize(SecurityContext.HTML,
        this.airlinestateForm.controls['StateCode'].value);
      objAirline.GSTNo = this.stateCode + this.airlinePan + this.sanitizer.sanitize(SecurityContext.HTML,
        this.airlinestateForm.controls['GSTNo'].value);
      objAirline.Address = this.sanitizer.sanitize(SecurityContext.HTML,
        this.airlinestateForm.controls['Address'].value);
      objAirline.EmailId = this.sanitizer.sanitize(SecurityContext.HTML,
        this.airlinestateForm.controls['EmailId'].value);
      objAirline.PhoneNo = this.sanitizer.sanitize(SecurityContext.HTML,
        this.airlinestateForm.controls['PhoneNo'].value);
      objAirline.CityName = this.sanitizer.sanitize(SecurityContext.HTML,
        this.airlinestateForm.controls['CityName'].value);
      objAirline.PinCode = this.sanitizer.sanitize(SecurityContext.HTML,
        this.airlinestateForm.controls['PinCode'].value);

      this.airlineService.AirlineStateMasterPost(objAirline).subscribe(
        (data) => {
          if (data['isError'] === false && data['code'] === 200) {
            this.commonfunction.showToast('success', 'Success', 'Successfully saved');

            const objULog: UserLog = new UserLog();
            objULog.Action = (this.AirStId > 0 ? 'Edit' : 'Create') + ' Airline State';
            objULog.UserId = this._auth.getUserId();
            objULog.PageName = objULog.PageName = (
              this.AirStId > 0 ? 'airlineStateEdit' : 'airlineStateCreate'
            );
            objULog.Notes = 'AirStId=' + this.AirStId;

            this.commservice.insertUserLog(objULog).subscribe(data3 => {
              // do something, success
            }, error => { alert(error); });
            setTimeout(() => {
              this._router.navigate(['airlineStateList']);
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

  onReset() {
    this.submitted = false;
    this.loading = false;
    if (this.AirStId > 0) {
      this.getAirlineStateData(this.AirStId);
    } else {
      this.airlinestateForm.get('StateCode').setValue('');
      this.airlinestateForm.get('CityName').setValue('');
      this.airlinestateForm.get('GSTNo').setValue('');
      this.airlinestateForm.get('EmailId').setValue('');
      this.airlinestateForm.get('PhoneNo').setValue('');
      this.airlinestateForm.get('PinCode').setValue('');
      this.airlinestateForm.get('Address').setValue('');

    }
  }

  onList(): void {
    this._router.navigate(['airlineStateList']);
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


  getAirlineAdminUserData(airid: number) {
    this.airlineService.getAirlineUserMasterList(0, airid, '00000000-0000-0000-0000-000000000000').subscribe(
      (data) => {
        if (data['isError'] === false && data['code'] === 200) {
          const AdminData = [];
          AdminData.push(data['payload'].filter(x => x.roleName === 'Airline Admin')[0]);
          this.airlinestateForm.get('EmailId').setValue(AdminData[0].email);
          this.airlinestateForm.get('PhoneNo').setValue(AdminData[0].contactNo);
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
  //           this.airlinestateForm.get('CityId').setValue(cId);
  //         }, 100);

  //       } else {
  //         this.stateCityArr = [];
  //       }
  //     },
  //   );
  // }

  // Get Airline StateMaster Data
  getAirlineStateData(airstId = 0, airlineid = 0) {
    this.airlineService.getAirlineStateMasterList(airstId, airlineid).subscribe(
      (data) => {
        if (data['isError'] === false && data['code'] === 200) {
          this.airlineStateArr = data['payload'];
        } else {
          this.airlineStateArr = [];
        }
        // Set values
        if (airstId > 0) {
          this.airlinestateForm.get('CityName').setValue(this.airlineStateArr.map(t => t.cityName)[0]);
          this.airlinestateForm.get('AirStId').setValue(this.airlineStateArr.map(t => t.airStId)[0]);
          this.airlinestateForm.get('StateCode').setValue(this.airlineStateArr.map(t => t.stateCode)[0]);
          const gstNo = this.airlineStateArr.map(t => t.gstNo)[0];
          this.stateCode = gstNo.slice(0, 2);
          this.airlinePan = gstNo.slice(2, 12);
          this.gstPrefix = this.stateCode + this.airlinePan;
          this.airlinestateForm.get('GSTNo').setValue(gstNo.slice(12, 15));
          this.airlinestateForm.get('EmailId').setValue(this.airlineStateArr.map(t => t.emailId)[0]);
          this.airlinestateForm.get('PhoneNo').setValue(this.airlineStateArr.map(t => t.phoneNo)[0]);
          this.airlinestateForm.get('PinCode').setValue(this.airlineStateArr.map(t => t.pinCode)[0]);
          this.airlinestateForm.get('Address').setValue(this.airlineStateArr.map(t => t.address)[0]);
        }
      },
    );
  }

  changeState(selectedVal: string) {
    // this.getCitiesDDLData(selectedVal, 0);
    this.stateCode = selectedVal;
    this.gstPrefix = this.stateCode + this.airlinePan;
  }
}
