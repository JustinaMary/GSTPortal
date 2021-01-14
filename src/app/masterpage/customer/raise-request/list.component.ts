import {
  Component, OnInit, DoCheck,
  ViewChild, ElementRef,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { LocalDataSource } from 'ng2-smart-table';
import { Router } from '@angular/router';
import { CustomerService } from '../../../services/customer.service';
import { AuthenticationService } from '../../../services/authentication.service';
import { UserLog } from '../../../models/common-model';
import { CommonService } from '../../../services/common.service';
import { AccountsService } from '../../../services/accounts.service';
import { CommonFunction } from '../../../common/common-functions';
import { Validation } from '../../../common/validation';
import { GstInfoService } from '../../../services/gstinfo.service';
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
    <ng2-smart-table class="table-responsive" [settings]="settings" [source]="source">
    </ng2-smart-table>
    <div *ngIf="totalRows" class="text-center">
      <label>Number of rows: {{totalRows}}</label>
    </div>
    </div>
  `,
})

export class BulkUploadResponseComponent implements OnInit, DoCheck {
  title: string;
  response: Array<any> = [];
  defaultRowPerPage = 10;
  source: LocalDataSource = new LocalDataSource();
  totalRows = 0;

  constructor(public bsModalRef: BsModalRef) { }

  ngOnInit() {
    // Bind data to Datatable
    this.source.load(this.response);
    this.source.count();
  }

  settings = {
    attr: {
      class: 'table',
    },
    hideSubHeader: true,
    mode: 'external',
    actions: false,
    pager: {
      display: true,
      perPage: this.defaultRowPerPage,
    },
    columns: {
      srno: {
        title: 'Sr No.',
        type: 'number',
        valuePrepareFunction: (value, row, cell) => {
          return (cell.row.index + 1); // Increment rows
        },
      },
      responseType: {
        title: 'Type',
        type: 'string',
        filter: false,
      },
      message: {
        title: 'Message',
        type: 'string',
        filter: false,
      },
    },
  };


  ngDoCheck() {
    this.totalRows = this.source != null ? this.source.count() : null;
  }
  // Set Datatable pager
  setPager() {
    this.source.setPaging(1, this.defaultRowPerPage, true);
    this.settings = Object.assign({}, this.settings);
  }

}

/* This is a component which we pass in modal*/

@Component({
  selector: 'ngx-modal-content',
  templateUrl: './bulkrequest.component.html',
})

export class BulkRequestComponent implements OnInit {
  title: string;
  csvForm: FormGroup;
  submitted = false;
  csvFile: File = null;
  fileExtensions = ['csv'];
  airlineArr: Array<any> = []; // List of airlines
  response: Array<any> = [];
  custuserid: 0;
  loading = false;
  userId: string;
  @ViewChild('csvDoc') csvDoc: ElementRef;

  constructor(public bsModalRef: BsModalRef,
    private custservice: CustomerService,
    private gstinfoservice: GstInfoService,
    private _auth: AuthenticationService,
    private commonfunction: CommonFunction,
    private formBuilder: FormBuilder,
    private validation: Validation,
    private modalService: BsModalService) { }

  ngOnInit() {
    this.userId = this._auth.getUserId();
    this.csvForm = this.formBuilder.group({
      airlineId: ['', [Validators.required]],
      csvDoc: ['', [Validators.required]],
    });
    this.getAirlineList();
    this.getCustUserData(this.userId);
  }

  get g() { return this.csvForm.controls; }

  getAirlineList() {
    this.gstinfoservice.getVerfAirList(this._auth.getCustId()).subscribe(
      (data) => {
        if (data['isError'] === false && data['code'] === 200) {
          this.airlineArr = data['payload'];
        } else {
          this.airlineArr = [];
        }
      },
    );
  }

  // Get Customer User Id
  getCustUserData(userid: string) {
    this.custservice.getCustomerUserMasterList(0, 0, userid).subscribe(
      (data) => {
        if (data['isError'] === false && data['code'] === 200) {
          this.custuserid = data['payload'][0]['custUserId'];
        } else {
          this.custuserid = 0;
        }
      },
    );

  }

  // send the csv file to backend
  onSubmitCsvFile() {
    this.submitted = true;
    if (this.csvForm.invalid) {
      return;
    }
    const formData: FormData = new FormData();
    this.loading = true;
    formData.append('file', this.csvFile, this.csvFile.name);
    formData.append('UserId', this.userId);
    formData.append('CreatedBy', this.custuserid.toString());
    formData.append('CustId', this._auth.getCustId());
    formData.append('AirlineId', this.csvForm.controls['airlineId'].value);
    this.custservice.raiseBulkRequest(formData).subscribe(
      (data) => {
        if (data['isError'] === true) {
          this.commonfunction.showToast('danger', 'Error', data['error']);
        } else {
          this.bsModalRef.hide();
          this.response = data['payload'];
          this.openResponseModalWithComponent();
        }
        this.loading = false;
      });
  }

  handleCsvUpload(files: FileList) {
    if (this.validation.validateFile(files[0].name, this.fileExtensions)) {
      this.csvFile = files.item(0);
    } else {
      this.commonfunction.showToast('warning', 'Format not Supported', 'Selected file format is not supported !');
      this.csvDoc.nativeElement.value = null;
    }
  }
  downloadDocument() {
    const link = document.createElement('a');
    link.setAttribute('type', 'hidden');
    link.href = 'assets/file/BulkQueryFormat.csv';
    link.download = 'BulkQueryFormat.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  openResponseModalWithComponent() {
    const initialState = {
      title: 'Query Response',
      response: this.response,
    };
    this.bsModalRef = this.modalService.show(BulkUploadResponseComponent, { initialState, class: 'modal-lg' });
  }

}


@Component({
  selector: 'ngx-list-raise-request',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})

export class RaiseRequestListComponent implements OnInit, DoCheck {
  defaultRowPerPage = 10;
  SerachValue = '';
  totalRows = 0;
  Swal = require('sweetalert2');
  raiseReqArr: Array<any> = []; // List of Raise Requests
  AirlineId = 0;
  UserId = '';
  source: LocalDataSource = new LocalDataSource();
  accessArr: Array<any> = []; // List of menuaccess
  bsModalRef: BsModalRef;

  settings = {
    attr: {
      class: 'table',
    },
    hideSubHeader: true,
    mode: 'external',
    actions: {
      add: false,
      edit: false,
      delete: false,
      custom: [
        { name: 'edit', title: '<i class="nb-edit" title="Edit"></i>' },
        { name: 'view', title: '<i class="nb-compose" title="Detail"></i>' },
      ],
      position: 'right',
    },
    pager: {
      display: true,
      perPage: this.defaultRowPerPage,
    },
    columns: {
      srno: {
        title: 'Sr No.',
        type: 'number',
        valuePrepareFunction: (value, row, cell) => {
          return (cell.row.index + 1); // Increment rows
        },
      },
      ticketNo: {
        title: 'Ticket No',
        type: 'string',
        filter: false,
      },
      gstNo: {
        title: 'GST No',
        type: 'string',
        filter: false,
      },
      transTypeText: {
        title: 'Transaction Type',
        type: 'string',
        filter: false,
      },
      statusNm: {
        title: 'Status',
        type: 'string',
        filter: false,
      },
      requestTypeStr: {
        title: 'Request Type',
        type: 'string',
        filter: false,
      },
      custName: {
        title: 'Customer',
        type: 'string',
        filter: false,
      },
    },
  };

  constructor(private custservice: CustomerService,
    private _router: Router,
    private _auth: AuthenticationService,
    private commservice: CommonService,
    private accservice: AccountsService,
    private commonfunction: CommonFunction,
    private modalService: BsModalService) {
  }

  ngOnInit(): void {
    this.UserId = this._auth.getUserId();
    this.AirlineId = this._auth.getAirlineId();
    this.accservice.getGetUserActions(this.UserId).subscribe(
      (data) => {
        if (data['message'] === 'Success') {
          this.accessArr = data['payload'];
          if (this.accessArr.filter(t => t.actionName === 'List' && t.module === 'Raise Request').length > 0) {
            this.getRaiseReqData();
          } else {
            const message = '401 Unauthorized page: Raise Request List';
            this.commonfunction.ErrorLogHdlFunc(message, this.UserId);
            this._router.navigate(['unauthorized']);
          }

          if (this.accessArr.filter(t => t.actionName === 'Update' && t.module === 'Raise Request').length === 0) {
            const item = this.settings.actions.custom.findIndex((t => t.name === 'edit'));
            this.settings.actions.custom.splice(item, 1);
          }
          if (this.accessArr.filter(t => t.actionName === 'Detail' && t.module === 'Raise Request').length === 0) {
            const item2 = this.settings.actions.custom.findIndex((t => t.name === 'view'));
            this.settings.actions.custom.splice(item2, 1);
          }
          this.settings = Object.assign({}, this.settings);
        }
      });
  }


  ngDoCheck() {
    this.totalRows = this.source != null ? this.source.count() : null;
  }

  openModalWithComponent() {
    const initialState = {
      title: 'Bulk Upload',
    };
    this.bsModalRef = this.modalService.show(BulkRequestComponent, { initialState });
    this.bsModalRef.content.closeBtnName = 'Close';
  }

  // Filter Search datatable
  onSearch(query: string = '') {
    if (query === '') {
      this.source.reset();
    } else {
      this.source.setFilter([
        // fields we want to include in the search
        {
          field: 'ticketNo',
          search: query,
        },
        {
          field: 'gstNo',
          search: query,
        },
        {
          field: 'transTypeText',
          search: query,
        },
        {
          field: 'statusNm',
          search: query,
        },
        {
          field: 'requestTypeStr',
          search: query,
        },
        {
          field: 'stateGst',
          search: query,
        },
        {
          field: 'custName',
          search: query,
        },
      ], false);
    }
  }

  // Set Datatable pager
  setPager() {
    this.source.setPaging(1, this.defaultRowPerPage, true);
    this.settings = Object.assign({}, this.settings);
  }

  // Datatable Custom action click
  onCustomAction(event) {
    switch (event.action) {
      case 'edit':
        this.onEdit(event.data);
        break;
      case 'view':
        this.onView(event.data);
    }
  }
  public onEdit(formData: any) {
    if (this.accessArr.filter(t => t.actionName === 'Update' && t.module === 'Raise Request').length === 0) {
      this.commonfunction.showToast('danger', 'Failed', 'Access Denied');
    } else {
      let id: number = 0;
      let idstr: string = '';
      id = formData['rrId'];
      const obj = {
        rrId: id,
      };
      idstr = this._auth.encryptData(obj);
      this._router.navigate(['raiseReqEdit/' + idstr]);
    }
  }

  public onView(formData: any) {
    if (this.accessArr.filter(t => t.actionName === 'Detail' && t.module === 'Raise Request').length === 0) {
      this.commonfunction.showToast('danger', 'Failed', 'Access Denied');
    } else {
      let id: number = 0;
      let idstr: string = '';
      id = formData['rrId'];
      const obj = {
        rrId: id,
      };
      idstr = this._auth.encryptData(obj);
      this._router.navigate(['raiseReqDetail/' + idstr]);
    }
  }

  onAdd(): void {
    if (this.accessArr.filter(t => t.actionName === 'Create' && t.module === 'Raise Request').length === 0) {
      this.commonfunction.showToast('danger', 'Failed', 'Access Denied');
    } else {
      this._router.navigate(['raiseReqCreate']);
    }
  }

  // Get Raise Request Master Data
  getRaiseReqData() {
    this.custservice.getRaiseRequestPageList(this.UserId).subscribe(
      (data) => {
        if (data['isError'] === false && data['code'] === 200) {
          this.raiseReqArr = data['payload'];

          const objULog: UserLog = new UserLog();
          objULog.Action = 'Raise Request List';
          objULog.UserId = this.UserId;
          objULog.PageName = 'raiseReqList';
          objULog.Notes = 'Raise Request List';

          this.commservice.insertUserLog(objULog).subscribe(data3 => {
            // do something, success
          }, error => { alert(error); });
        } else {
          this.raiseReqArr = [];
        }
        // Bind data to Datatable
        this.source.load(this.raiseReqArr);
        this.source.count();
      },
    );
  }
}




