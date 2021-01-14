import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit, Input, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { CustomerService } from '../../../services/customer.service';
import { CommonFunction } from '../../../common/common-functions';
import { RaiseRequestTbl, RaiseRequestPost } from '../../../models/customer-model';
import { AuthenticationService } from '../../../services/authentication.service';
import { UserLog } from '../../../models/common-model';
import { CommonService } from '../../../services/common.service';
import { AccountsService } from '../../../services/accounts.service';
import { Validation } from '../../../common/validation';
import { GstInfoService } from '../../../services/gstinfo.service';
import { AirlineService } from '../../../services/airline.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'ngx-create-raise-request',
  templateUrl: './create.component.html',
})
export class RaiseRequestCreateComponent implements OnInit {
  raiseReqForm: FormGroup;
  submitted = false;
  title = '';
  sub: any;
  reqtypeArr: Array<any> = []; // Request Type
  stateArr: Array<any> = []; // List of state gst
  statusArr: Array<any> = []; // List of Status
  historyArr: Array<any> = []; // List of History
  raisereqArr: Array<any> = []; // List of History
  isDisabled = false;
  isFieldsDisabled = false;
  isTableDisplay = true;
  custuserid = 0;
  userid = '';
  accessArr: Array<any> = []; // List of menuaccess
  customerGstNos: Array<any>;
  transactionTypeArr: Array<any> = []; // List of transType based on airline
  popupText = '';
  selectedTransType: any;
  isAirlineLogin = false;
  loading = false;
  @Input() RrId: number;

  constructor(private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private _router: Router,
    private custService: CustomerService,
    private _auth: AuthenticationService,
    private commservice: CommonService,
    private commonfunction: CommonFunction,
    private accservice: AccountsService,
    private sanitizer: DomSanitizer, private validation: Validation,
    private gstinfoservice: GstInfoService,
    private airservice: AirlineService,
    private modalService: NgbModal) { }

  ngOnInit() {
    this.getReqTypeData();
    this.getStatusData();
    this.userid = this._auth.getUserId();
    this.sub = this.route.params.subscribe(params => {
      const id = this._auth.decryptData(params['rrId']) || 0;
      this.RrId = id['rrId'] || 0;
      this.title = ((this.RrId !== undefined && this.RrId > 0) ? 'Edit - Raised ' : 'Create New ') + 'Query';

      this.accservice.getGetUserActions(this.userid).subscribe(
        (data) => {
          if (data['message'] === 'Success') {
            this.accessArr = data['payload'];
            if (this.accessArr.filter(t => t.actionName === (this.RrId > 0 ? 'Update' : 'Create')
              && t.module === 'Raise Request').length > 0) {
              const userid = this.userid;
              if (this._auth.getCustId() > 0) {
                this.getCustUserData(userid);
              }
              this.getRaiseReqData(this.RrId);
            } else {
              const message = '401 Unauthorized page: ' + this.title;
              this.commonfunction.ErrorLogHdlFunc(message, this.userid);
              this._router.navigate(['unauthorized']);
            }

          }
        });


    });

    // this.getStateGstData(this.RrId);

    this.raiseReqForm = this.formBuilder.group({
      TicketNo: ['', (this.RrId === 0 ?
        [Validators.required, this.validation.IsAirlineExist, this.validation.isAirlineTktExistsValidation] : '')],
      PNRNo: [''],
      GSTNo: ['', [Validators.required]],
      TransType: ['', (this.RrId === 0 ? [Validators.required] : '')],
      RequestType: ['', (this.RrId === 0 ? [Validators.required] : '')],
      Status: ['', [Validators.required]],
      Notes: [''],
      RequestedOn: [''],
      RequestBy: [''],
      RrId: [0],
    }, {
        validator: [
          this.validation.IsAirlineExist('TicketNo'),
          this.validation.isAirlineTktExistsValidation('TicketNo', this._auth.getCustId(), this.RrId),
        ],
      });

    this.gstinfoservice.getCustomerGstStates(this._auth.getUserId()).subscribe(
      (data) => {
        if (data['message'] === 'Success') {
          const gstList = data['payload'];
          if (gstList.length > 0) {
            this.customerGstNos = gstList;
          }
        }
      });

    if (this._auth.getAirlineId() > 0) {
      this.isAirlineLogin = true;
    }
  }


  get f() { return this.raiseReqForm.controls; }

  onSubmit() {
    this.submitted = true;
    if (this.raiseReqForm.valid) {
      this.isDisabled = true;
      this.loading = true;
      const objRaiseReq: RaiseRequestTbl = new RaiseRequestTbl();
      objRaiseReq.RequestBy = (this.RrId > 0 ?
        this.raiseReqForm.controls['RequestBy'].value : this.custuserid);
      objRaiseReq.RrId = this.raiseReqForm.controls['RrId'].value;
      objRaiseReq.TicketNo = this.sanitizer.sanitize(SecurityContext.HTML,
        this.raiseReqForm.controls['TicketNo'].value);
      objRaiseReq.PNRNo = this.sanitizer.sanitize(SecurityContext.HTML,
        this.raiseReqForm.controls['PNRNo'].value);
      objRaiseReq.GstNo = this.sanitizer.sanitize(SecurityContext.HTML,
        this.raiseReqForm.controls['GSTNo'].value);
      objRaiseReq.TransType = this.raiseReqForm.controls['TransType'].value;
      objRaiseReq.TransTypeText = this.sanitizer.sanitize(SecurityContext.HTML,
        this.selectedTransType);
      objRaiseReq.RequestType = this.raiseReqForm.controls['RequestType'].value;
      objRaiseReq.Status = this.raiseReqForm.controls['Status'].value;
      objRaiseReq.RequestedOn = (this.raiseReqForm.controls['RequestedOn'].value !== '' ?
        this.raiseReqForm.controls['RequestedOn'].value : new Date);

      const objMain: RaiseRequestPost = new RaiseRequestPost();
      objMain.raiseRequest = objRaiseReq;
      objMain.UserId = this.userid;
      objMain.Notes = this.sanitizer.sanitize(SecurityContext.HTML,
        this.raiseReqForm.controls['Notes'].value);
      objMain.CreatedBy = this.userid;

      this.custService.RaiseReqPost(objMain).subscribe(
        (data) => {
          if (data['isError'] === false && data['code'] === 200 && data['payload']) {
            if (this.RrId === 0) {
              document.getElementById('openModalButton').click();
              this.popupText = data['payload'];
            } else {
              this.commonfunction.showToast('success', 'Updated', data['payload']);
            }
            const objULog: UserLog = new UserLog();
            objULog.Action = (this.RrId > 0 ? 'Edit Raised' : 'Create New') + ' Request';
            objULog.UserId = this.userid;
            objULog.PageName = objULog.PageName = (
              this.RrId > 0 ? 'raiseReqEdit' : 'raiseReqCreate'
            );
            objULog.Notes = 'RrId=' + this.RrId;

            this.commservice.insertUserLog(objULog).subscribe(data3 => {
              // do something, success
            }, error => { alert(error); });
            setTimeout(() => {
              this._router.navigate(['raiseReqList']);
            }, 1500);
          } else {
            this.commonfunction.showToast('danger', 'Failed', 'Something went wrong !');
            this.isDisabled = false;
          }
          this.loading = false;
        },
      );
    }
  }

  onReset() {
    this.submitted = false;
    if (this.RrId > 0) {
      this.getRaiseReqData(this.RrId);
    } else {
      this.raiseReqForm.get('TicketNo').setValue('');
      this.raiseReqForm.get('PNRNo').setValue('');
      this.raiseReqForm.get('RequestType').setValue('');
      this.raiseReqForm.get('StateId').setValue('');
      this.raiseReqForm.get('Status').setValue('6'); // 6 for new
      this.raiseReqForm.get('Notes').setValue('');
      this.raiseReqForm.get('RequestedOn').setValue('');
    }
  }

  onList(): void {
    this._router.navigate(['raiseReqList']);
  }

  // Get Request Master list
  getReqTypeData() {
    this.commservice.getRequestMasterList(0).subscribe(
      (data) => {
        if (data['isError'] === false && data['code'] === 200) {
          this.reqtypeArr = data['payload'];
        } else {
          this.reqtypeArr = [];
        }
      },
    );
  }

  // Get State code list
  getStateGstData(rrid: number, stateid: number = 0) {
    let userid = '00000000-0000-0000-0000-000000000000';
    let custstid = 0;

    if (rrid === 0) {
      userid = this.userid;
    } else {
      custstid = stateid;
    }
    this.custService.getCustStateUserList(userid, custstid).subscribe(
      (data) => {
        if (data['isError'] === false && data['code'] === 200) {
          this.stateArr = data['payload'];
        } else {
          this.stateArr = [];
        }
      },
    );
  }

  // Get Status list
  getStatusData() {
    this.commservice.getEnumData('RRS').subscribe(
      (data) => {
        if (data['isError'] === false && data['code'] === 200) {
          this.statusArr = data['payload'];
        } else {
          this.statusArr = [];
        }
      },
    );
  }

  // Get Customer User Id
  getCustUserData(userid: string) {
    this.custService.getCustomerUserMasterList(0, 0, userid).subscribe(
      (data) => {
        if (data['isError'] === false && data['code'] === 200) {
          this.custuserid = data['payload'][0]['custUserId'];
        } else {
          this.custuserid = 0;
        }
      },
    );

  }

  // Get Raise Request Data
  getRaiseReqData(RrId = 0) {
    this.custService.getRaiseRequestList(RrId).subscribe(
      (data) => {
        if (data['isError'] === false && data['code'] === 200) {
          this.raisereqArr = data['payload']['raiseRequest'];
          this.historyArr = data['payload']['raiseRequestHistory'];
          this.getStateGstData(RrId, this.raisereqArr.map(t => t.stateId)[0]);

        } else {
          this.raisereqArr = [];
          this.historyArr = [];
          this.getStateGstData(RrId, 0);
        }
        // Set values
        if (RrId > 0) {
          const ticketNo = this.raisereqArr.map(t => t.ticketNo)[0];
          this.onTicketChange(ticketNo.substring(0, 3));
          this.raiseReqForm.get('RrId').setValue(this.raisereqArr.map(t => t.rrId)[0]);
          this.raiseReqForm.get('TicketNo').setValue(this.raisereqArr.map(t => t.ticketNo)[0]);
          this.raiseReqForm.get('PNRNo').setValue(this.raisereqArr.map(t => t.pnrNo)[0]);
          this.raiseReqForm.get('RequestType').setValue(this.raisereqArr.map(t => t.requestType)[0]);
          this.raiseReqForm.get('Status').setValue(this.raisereqArr.map(t => t.status)[0]);
          this.raiseReqForm.get('RequestedOn').setValue(this.raisereqArr.map(t => t.requestedOn)[0]);
          this.raiseReqForm.get('RequestBy').setValue(this.raisereqArr.map(t => t.requestBy)[0]);
          this.raiseReqForm.get('GSTNo').setValue(this.raisereqArr.map(t => t.gstNo)[0]);
          this.raiseReqForm.get('TransType').setValue(this.raisereqArr.map(t => t.transType)[0]);
          this.isFieldsDisabled = true;
        } else {
          this.raiseReqForm.get('Status').setValue(6);
        }

        if (this.historyArr.length > 0) {
          this.isTableDisplay = true;
        } else {
          this.isTableDisplay = false;
        }
      },
    );
  }

  onTicketChange(value: any) {
    if (value.length >= 3) {
      this.airservice.getAirlineMasterWithCode(value.substring(0, 3)).subscribe(
        (data) => {
          if (data['isError'] === false && data['code'] === 200 && data['payload'].length > 0) {
            const airline = data['payload'];
            this.getTransTypeList(airline[0].airlineId);
          } else {
            this.commonfunction.showToast('danger', 'Error', 'Airline for this code is not exist');
            this.transactionTypeArr = [];
          }
        },
      );
    }
  }
  getTransTypeList(airid: number) {
    this.airservice.transactionTypeList(0, airid).subscribe(
      (data) => {
        if (data['isError'] === false && data['code'] === 200) {
          this.transactionTypeArr = data['payload'];
        } else {
          this.transactionTypeArr = [];
        }
      },
    );
  }

  openPopup(content) {
    this.modalService.open(content, { centered: true });
  }

  onTransTypeselected(value: any) {
    this.selectedTransType = this.transactionTypeArr.find(t => t.typeId === value).transType;
  }

}
