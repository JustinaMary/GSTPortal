import { FormBuilder, FormGroup } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CustomerService } from '../../../services/customer.service';
import { RaiseRequestTbl, RaiseRequestPost } from '../../../models/customer-model';
import { AuthenticationService } from '../../../services/authentication.service';
import { CommonService } from '../../../services/common.service';
import { AccountsService } from '../../../services/accounts.service';
import { CommonFunction } from '../../../common/common-functions';

@Component({
    selector: 'ngx-detail-raise-request',
    templateUrl: './detail.component.html',
})
export class RaiseRequestDetailComponent implements OnInit {
    raiseReqDtlsForm: FormGroup;
    title = '';
    sub: any;
    reqtypeArr: Array<any> = []; // Request Type
    stateArr: Array<any> = []; // List of state gst
    historyArr: Array<any> = []; // List of History
    raisereqArr: Array<any> = []; // List of History
    isTableDisplay = true;
    custuserid = 0;
    TicketNo = '';
    PNRNo = '';
    RequestType = '';
    StateId = '';
    accessArr: Array<any> = []; // List of menuaccess

    @Input() RrId: number;

    constructor(private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private _router: Router,
        private custService: CustomerService,
        private _auth: AuthenticationService,
        private commonfunction: CommonFunction,
        private accservice: AccountsService,
        private commservice: CommonService) { }
    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
            const id = this._auth.decryptData(params['rrId']) || 0;
            this.RrId = id['rrId'] || 0;
            this.title = 'Raise Request Detail';

            this.accservice.getGetUserActions(this._auth.getUserId()).subscribe(
                (data) => {
                    if (data['message'] === 'Success') {
                        this.accessArr = data['payload'];
                        if (this.accessArr.filter(t => t.actionName === 'Detail'
                            && t.module === 'Raise Request').length > 0) {
                            this.getRaiseReqData(this.RrId);
                        } else {
                            const message = '401 Unauthorized page: ' + this.title;
                            this.commonfunction.ErrorLogHdlFunc(message, this._auth.getUserId());
                            this._router.navigate(['unauthorized']);
                        }

                    }
                });

        });

        this.raiseReqDtlsForm = this.formBuilder.group({
            RrId: [0],
        });
    }

    onList(): void {
        this._router.navigate(['raiseReqList']);
    }

    // Get Request Master list
    getReqTypeData(id: number) {
        this.commservice.getRequestMasterList(id).subscribe(
            (data) => {
                if (data['isError'] === false && data['code'] === 200) {
                    this.reqtypeArr = data['payload'];
                    this.RequestType = this.reqtypeArr[0]['description'];
                } else {
                    this.reqtypeArr = [];
                    this.RequestType = '';
                }
            },
        );
    }

    // Get State code list
    getStateGstData(rrid: number, stateid: number = 0) {
        const userid = '00000000-0000-0000-0000-000000000000';

        this.custService.getCustStateUserList(userid, stateid).subscribe(
            (data) => {
                if (data['isError'] === false && data['code'] === 200) {
                    this.stateArr = data['payload'];
                    this.StateId = this.stateArr[0]['stateCode'] + ' - ' + this.stateArr[0]['stateName'];
                } else {
                    this.stateArr = [];
                    this.StateId = '';
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
                    this.getReqTypeData(this.raisereqArr.map(t => t.requestType)[0]);
                    this.getStateGstData(RrId, this.raisereqArr.map(t => t.stateId)[0]);

                } else {
                    this.raisereqArr = [];
                    this.historyArr = [];
                    this.getReqTypeData(0);
                    this.getStateGstData(RrId, 0);
                }
                // Set values
                if (RrId > 0) {
                    this.raiseReqDtlsForm.get('RrId').setValue(this.raisereqArr.map(t => t.rrId)[0]);
                    this.TicketNo = this.raisereqArr.map(t => t.ticketNo)[0];
                    this.PNRNo = this.raisereqArr.map(t => t.pnrNo)[0];
                }

                if (this.historyArr.length > 0) {
                    this.isTableDisplay = true;
                } else {
                    this.isTableDisplay = false;
                }
            },
        );
    }

}
