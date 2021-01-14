import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { CustomerService } from '../../../services/customer.service';
import { AuthenticationService } from '../../../services/authentication.service';
import { UserLog } from '../../../models/common-model';
import { B2CGstRequestRM } from '../../../models/customer-model';
import { CommonService } from '../../../services/common.service';
import { AccountsService } from '../../../services/accounts.service';
import { CommonFunction } from '../../../common/common-functions';

@Component({
  selector: 'ngx-list-b2c-gst-request',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})

export class B2CGstRequestListComponent implements OnInit {
  defaultRowPerPage = 10;
  SerachValue = '';
  totalRows = 0;
  searchStr = '';
  Swal = require('sweetalert2');
  raiseReqArr: Array<any> = []; // List of Raise Requests
  airid = 0;
  source: LocalDataSource = new LocalDataSource();
  accessArr: Array<any> = []; // List of menuaccess

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
          const paging = this.source.getPaging();
          const srno = (paging.page - 1) * paging.perPage + cell.row.index + 1;
          return srno;
        },
      },
      ticketNumber: {
        title: 'Ticket No',
        type: 'string',
        filter: false,
        sort: false,
      },
      pnr: {
        title: 'PNR No',
        type: 'string',
        filter: false,
        sort: false,
      },
      gstNo: {
        title: 'GST No',
        type: 'string',
        filter: false,
        sort: false,
      },
      dateOfIssue: {
        title: 'Date Of Issue',
        type: 'string',
        filter: false,
        sort: false,
        valuePrepareFunction: (date) => {
          return moment(date).format('DD MMM YYYY');
        },
      },
      email: {
        title: 'Email',
        type: 'string',
        filter: false,
        sort: false,
      },
      contactNo: {
        title: 'Contact No',
        type: 'string',
        filter: false,
        sort: false,
      },
      statusNm: {
        title: 'Status',
        type: 'string',
        filter: false,
        sort: false,
      },
    },
  };

  constructor(private custservice: CustomerService,
    private _router: Router,
    private _auth: AuthenticationService,
    private commservice: CommonService,
    private accservice: AccountsService,
    private commonfunction: CommonFunction,
  ) {
  }

  ngOnInit(): void {
    this.accservice.getGetUserActions(this._auth.getUserId()).subscribe(
      (data) => {
        if (data['message'] === 'Success') {
          this.accessArr = data['payload'];
          if (this.accessArr.filter(t => t.actionName === 'List' && t.module === 'B2C GST Request').length > 0) {
            this.getB2CGstReqData();
          } else {
            const message = '401 Unauthorized page: B2C GST Request List';
            this.commonfunction.ErrorLogHdlFunc(message, this._auth.getUserId());
            this._router.navigate(['unauthorized']);
          }

        }
      });

    this.source.onChanged().subscribe((change) => {
      const search = this.searchStr;
      if (change.action === 'paging' || change.action === 'page' || change.action === 'load') {
        this.pagingChange(change.paging.page, search);
      }
    });
  }

  // Filter Search datatable
  onSearch(query: string = '') {
    this.source.load([]);
  }

  // Set Datatable pager
  setPager() {
    this.source.setPaging(1, this.defaultRowPerPage, true);
    this.settings = Object.assign({}, this.settings);
  }

  // Get Raise Request Master Data
  getB2CGstReqData() {
    const userid = this._auth.getUserId();

    const objMain: B2CGstRequestRM = new B2CGstRequestRM();
    objMain.UserId = userid;
    objMain.Page = 1;
    objMain.PageSize = Number(this.defaultRowPerPage) + 100;
    objMain.SearchStr = this.searchStr;
    this.custservice.getB2cReqPerPageList(objMain).subscribe(
      (data) => {
        if (data['isError'] === false && data['code'] === 200) {
          this.raiseReqArr = data['payload'];
          this.totalRows = data['pagination']['totalItemsCount'];
          const objULog: UserLog = new UserLog();
          objULog.Action = 'B2C GST Request List';
          objULog.UserId = this._auth.getUserId();
          objULog.PageName = 'b2cGstReqList';
          objULog.Notes = 'B2C GST Request List';

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

  pagingChange(pageIndex, searchitem) {
    const loadedRecordCount = this.source.count();
    const lastRequestedRecordIndex = pageIndex * Number(this.defaultRowPerPage);

    if (loadedRecordCount <= lastRequestedRecordIndex) {
      const startIndex = Number(loadedRecordCount) + 1;
      const recordCount = Number(this.defaultRowPerPage) + 100; // extra 100 records improves UX.
      const userid = this._auth.getUserId();

      const objMain: B2CGstRequestRM = new B2CGstRequestRM();
      objMain.UserId = userid;
      objMain.Page = startIndex;
      objMain.PageSize = recordCount;
      objMain.SearchStr = searchitem;
      this.custservice.getB2cReqPerPageList(objMain).subscribe(
        (data) => {
          if (data['isError'] === false && data['code'] === 200) {
            this.totalRows = data['pagination']['totalItemsCount'];
            if (this.source.count() > 0) {
              data['payload'].forEach(d => this.source.add(d));
              this.source.getAll()
                .then(d => this.source.load(d));
            } else {
              this.source.load(data['payload']);
            }
          } else {
            this.totalRows = 0;
          }
        });
    }
  }

}
