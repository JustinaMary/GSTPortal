import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit, Input, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { AirlineService } from '../../../services/airline.service';
import { CommonFunction } from '../../../common/common-functions';
import { Airline } from '../../../models/airlines-model';
import { AuthenticationService } from '../../../services/authentication.service';
import { UserLog } from '../../../models/common-model';
import { CommonService } from '../../../services/common.service';
import { AccountsService } from '../../../services/accounts.service';

@Component({
  selector: 'ngx-create-airline',
  templateUrl: './create.component.html',
})
export class CreateComponent implements OnInit {
  airlinemasterForm: FormGroup;
  submitted = false;
  title = '';
  sub: any;
  airlineArr: Array<any> = []; // List of airlines
  allAirlineArr: Array<any> = []; // List of all airlines
  AirlineNameArr: Array<any> = [];
  isDisabled = false;
  accessArr: Array<any> = []; // List of menuaccess
  airlineSelected = [];
  DefairlineSelected = [];

  @Input() AirlineId: number;

  constructor(private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private _router: Router,
    private airservice: AirlineService,
    private _auth: AuthenticationService,
    private commservice: CommonService,
    private commonfunction: CommonFunction,
    private accservice: AccountsService,
    private sanitizer: DomSanitizer) { }
  ngOnInit() {
    this.airlinemasterForm = this.formBuilder.group({
      AirlineName: ['', [Validators.required]],
      AirlineCode: ['', [Validators.required]],
      Digit3Code: ['', [Validators.required]],
      PANNo: ['', [Validators.required, Validators.pattern('^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$')]],
      IsOwnServer: [false],
      CustomerVerify: [false],
      CanAccess: [false],
      PermitAgents: [false],
      AirlineId: [0],
      groupAirlines: [[]],
    }, {
      validator: [
        this.commonfunction.UniqueCheck('AirlineCode', 'AM1', 'AirlineId', '0'),
        this.commonfunction.UniqueCheck('Digit3Code', 'AM2', 'AirlineId', '0'),
      ],
    });

    this.sub = this.route.params.subscribe(params => {
      const id = this._auth.decryptData(params['airlineId']) || 0;
      this.AirlineId = id['airlineId'] || 0;
      this.title = ((this.AirlineId !== undefined && this.AirlineId > 0) ? 'Edit' : 'Create') + ' - Airline Master';

      this.accservice.getGetUserActions(this._auth.getUserId()).subscribe(
        (data) => {
          if (data['message'] === 'Success') {
            this.accessArr = data['payload'];
            if (this.accessArr.filter(t => t.actionName === (this.AirlineId > 0 ? 'Update' : 'Create')
              && t.module === 'Airline Master').length > 0) {
              this.getAirlineData(this.AirlineId);
            } else {
              const message = '401 Unauthorized page: ' + this.title;
              this.commonfunction.ErrorLogHdlFunc(message, this._auth.getUserId());
              this._router.navigate(['unauthorized']);
            }

          }
        });


    });

  }

  get f() { return this.airlinemasterForm.controls; }

  onSubmit() {
    this.submitted = true;
    if (this.airlinemasterForm.valid) {
      this.isDisabled = true;
      const objAirline: Airline = new Airline();
      objAirline.CreatedBy = this._auth.getUserId();
      objAirline.AirlineId = this.airlinemasterForm.controls['AirlineId'].value;
      objAirline.AirlineName = this.sanitizer.sanitize(SecurityContext.HTML,
        this.airlinemasterForm.controls['AirlineName'].value);
      objAirline.AirlineCode = this.sanitizer.sanitize(SecurityContext.HTML,
        this.airlinemasterForm.controls['AirlineCode'].value);
      objAirline.Digit3Code = this.sanitizer.sanitize(SecurityContext.HTML,
        this.airlinemasterForm.controls['Digit3Code'].value);
      objAirline.PANNo = this.sanitizer.sanitize(SecurityContext.HTML,
        this.airlinemasterForm.controls['PANNo'].value);
      objAirline.IsOwnServer = this.airlinemasterForm.controls['IsOwnServer'].value;
      objAirline.CustomerVerify = this.airlinemasterForm.controls['CustomerVerify'].value;
      objAirline.CanAccess = this.airlinemasterForm.controls['CanAccess'].value;
      objAirline.PermitAgents = this.airlinemasterForm.controls['PermitAgents'].value;
      objAirline.groupAirlines = this.airlineSelected.join(',');

      this.airservice.AirlineMasterPost(objAirline).subscribe(
        (data) => {
          if (data['isError'] === false && data['code'] === 200) {
            this.commonfunction.showToast('success', 'Success', 'Successfully saved');

            const objULog: UserLog = new UserLog();
            objULog.Action = (this.AirlineId > 0 ? 'Edit' : 'Create') + ' Airline Master';
            objULog.UserId = this._auth.getUserId();
            objULog.PageName = objULog.PageName = (this.AirlineId > 0 ? 'airlineEdit' : 'airlineCreate');
            objULog.Notes = 'AirlineId=' + this.AirlineId;

            this.commservice.insertUserLog(objULog).subscribe(data3 => {
              // do something, success
            }, error => { alert(error); });

            setTimeout(() => {
              this._router.navigate(['airlineList']);
            }, 1500);
          } else {
            this.commonfunction.showToast('danger', 'Failed', 'Not saved');
            this.isDisabled = false;
          }
        },
      );

    }
  }

  onReset() {
    this.submitted = false;
    this.airlineSelected = this.DefairlineSelected;
    this.AirlineNameArr = [];
    if (this.AirlineId > 0) {
      this.getAirlineData(this.AirlineId);
    } else {
      this.airlinemasterForm.reset();
    }
  }

  onList(): void {
    this._router.navigate(['airlineList']);
  }

  // Get Airline Master Data
  getAirlineData(airlineid = 0) {
    this.airservice.getAirlineMasterList(0).subscribe(
      (data) => {
        if (data['isError'] === false && data['code'] === 200) {

          this.allAirlineArr = data['payload'];
          this.airlineArr = data['payload'].filter(x => x.airlineId === airlineid);

          const item = this.allAirlineArr.findIndex(t => t.airlineId === airlineid);
          this.allAirlineArr.splice(item, 1);

        } else {
          this.allAirlineArr = [];
          this.airlineArr = [];
        }
        // Set values
        if (airlineid > 0) {
          this.airlinemasterForm.get('AirlineId').setValue(this.airlineArr.map(t => t.airlineId)[0]);
          this.airlinemasterForm.get('AirlineName').setValue(this.airlineArr.map(t => t.airlineName)[0]);
          this.airlinemasterForm.get('AirlineCode').setValue(this.airlineArr.map(t => t.airlineCode)[0]);
          this.airlinemasterForm.get('Digit3Code').setValue(this.airlineArr.map(t => t.digit3Code)[0]);
          this.airlinemasterForm.get('PANNo').setValue(this.airlineArr.map(t => t.panNo)[0]);
          this.airlinemasterForm.get('IsOwnServer').setValue(
            this.airlineArr.map(t => t.isOwnServer)[0],
          );
          this.airlinemasterForm.get('CustomerVerify').setValue(
            this.airlineArr.map(t => t.customerVerify)[0],
          );
          this.airlinemasterForm.get('CanAccess').setValue(
            this.airlineArr.map(t => t.canAccess)[0],
          );
          this.airlinemasterForm.get('PermitAgents').setValue(
            this.airlineArr.map(t => t.permitAgents)[0],
          );

          const splitted = this.airlineArr.map(t => t.groupAirlines)[0].split(',');
          this.airlineSelected = [];
          // this.DefairlineSelected = [];
          this.AirlineNameArr = [];
          for (const [key] of Object.entries(this.allAirlineArr)) {
            if (splitted.indexOf(this.allAirlineArr[key]['airlineId'].toString()) > -1) {
              this.airlineSelected.push(this.allAirlineArr[key]['airlineId']);
              this.DefairlineSelected.push(this.allAirlineArr[key]['airlineId']);
              this.AirlineNameArr.push(this.allAirlineArr[key]['airlineName']);
            }
          }


        }
      },
    );
  }

  selectedAirlines(a: any) {
    this.AirlineNameArr = [];
    if (a.length > 0) {
      for (let i = 0; i < a.length; i++) {
        const aName = this.allAirlineArr.filter(t => t.airlineId === a[i])[0]['airlineName'];
        this.AirlineNameArr.push(aName);
      }
    }
  }

}
