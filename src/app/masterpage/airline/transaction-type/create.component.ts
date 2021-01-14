import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AirlineService } from '../../../services/airline.service';
import { CommonFunction } from '../../../common/common-functions';
import { TransactionType } from '../../../models/airlines-model';
import { AuthenticationService } from '../../../services/authentication.service';
import { UserLog } from '../../../models/common-model';
import { CommonService } from '../../../services/common.service';
import { AccountsService } from '../../../services/accounts.service';

@Component({
  selector: 'ngx-create-transtype-airline',
  templateUrl: './create.component.html',
})
export class TransTypeCreateComponent implements OnInit {
  transTypeForm: FormGroup;
  submitted = false;
  title = '';
  sub: any;
  isDisabled = false;
  airid = 0;
  accessArr: Array<any> = []; // List of menuaccess
  loading = false;
  @Input() TypeId: number = 0;

  constructor(private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private _router: Router,
    private airlineService: AirlineService,
    private _auth: AuthenticationService,
    private commservice: CommonService,
    private accservice: AccountsService,
    private commonfunction: CommonFunction,
  ) { }
  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      const id = this._auth.decryptData(params['typeId']) || 0;
      this.TypeId = id['typeId'] || 0;
      this.title = ((this.TypeId !== undefined && this.TypeId > 0) ? 'Edit' : 'Create') + ' - Transaction Type';
      this.accservice.getGetUserActions(this._auth.getUserId()).subscribe(
        (data) => {
          if (data['message'] === 'Success') {
            this.accessArr = data['payload'];
            if (this.accessArr.filter(t => t.actionName === (this.TypeId > 0 ? 'Update' : 'Create')
              && t.module === 'Transaction Type').length > 0) {
              this.airid = this._auth.getAirlineId();
              this.getTransTypeData(this.TypeId, this.airid);

            } else {
              const message = '401 Unauthorized page: ' + this.title;
              this.commonfunction.ErrorLogHdlFunc(message, this._auth.getUserId());
              this._router.navigate(['unauthorized']);
            }

          }
        });


    });


    this.transTypeForm = this.formBuilder.group({
      TransType: ['', [Validators.required]],
      Description: ['', [Validators.required]],
    },
    );

  }

  get f() { return this.transTypeForm.controls; }

  onSubmit() {
    this.submitted = true;
    if (this.transTypeForm.valid) {
      this.loading = true;
      this.isDisabled = true;
      this.airid = this._auth.getAirlineId();

      const objTransactionType: TransactionType = new TransactionType();
      objTransactionType.CreatedBy = this._auth.getUserId();
      objTransactionType.TypeId = this.TypeId;
      objTransactionType.AirlineId = this.airid;
      objTransactionType.TransType = this.transTypeForm.controls['TransType'].value;
      objTransactionType.Description = this.transTypeForm.controls['Description'].value;

      this.airlineService.transactionTypePost(objTransactionType).subscribe(
        (data) => {
          if (data['isError'] === false && data['code'] === 200) {
            this.commonfunction.showToast('success', 'Success', 'Successfully saved');

            const objULog: UserLog = new UserLog();
            objULog.Action = (this.TypeId > 0 ? 'Edit' : 'Create') + ' Transaction Type';
            objULog.UserId = this._auth.getUserId();
            objULog.PageName = objULog.PageName = (
              this.TypeId > 0 ? 'transTypeEdit' : 'transTypeCreate'
            );
            objULog.Notes = 'TypeId=' + this.TypeId;
            this.commservice.insertUserLog(objULog).subscribe(data3 => {
              // do something, success
            }, error => { alert(error); });
            setTimeout(() => {
              this._router.navigate(['transTypeList']);
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
    if (this.TypeId > 0) {
      this.getTransTypeData(this.TypeId, this.airid);
    } else {
      this.transTypeForm.get('TransType').setValue('');
      this.transTypeForm.get('Description').setValue('');
    }
  }

  onList(): void {
    this._router.navigate(['transTypeList']);
  }

  // Get Transaction Type Data
  getTransTypeData(typeId = 0, airlineid = 0) {
    this.airlineService.transactionTypeList(typeId, airlineid).subscribe(
      (data) => {
        let payloadData = [];
        if (data['isError'] === false && data['code'] === 200) {
          payloadData = data['payload'];
        }
        // Set values
        if (typeId > 0) {
          this.transTypeForm.get('TransType').setValue(payloadData.map(t => t.transType)[0]);
          this.transTypeForm.get('Description').setValue(payloadData.map(t => t.description)[0]);
        }
      },
    );
  }

}
