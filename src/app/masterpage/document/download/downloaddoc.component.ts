import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit, DoCheck } from '@angular/core';
import * as moment from 'moment';
import { LocalDataSource } from 'ng2-smart-table';
import { NbDateService } from '@nebular/theme';
import { AirlineService } from '../../../services/airline.service';
import { GstInfoService } from '../../../services/gstinfo.service';
import { AuthenticationService } from '../../../services/authentication.service';
import { UserLog } from '../../../models/common-model';
import { GstInfoRequest, GstInfoDownloadRequest } from '../../../models/gstinfo-model';
import { CommonService } from '../../../services/common.service';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { AccountsService } from '../../../services/accounts.service';
import { Router } from '@angular/router';
import { CommonFunction } from '../../../common/common-functions';

@Component({
  selector: 'ngx-list-downloaddoc',
  templateUrl: './downloaddoc.component.html',
  styleUrls: ['./downloaddoc.component.scss'],
})
export class DownloadDocComponent implements OnInit, DoCheck {
  gstdownloadForm: FormGroup;
  defaultRowPerPage = 10;
  totalRows = 0;
  submitted = false;
  Swal = require('sweetalert2');
  gstdataArr: Array<any> = []; // List of airlines
  airlineArr: Array<any> = []; // List of airlines
  transactionTypeArr: Array<any> = []; // List of airlines
  selectedRows: Array<any> = [];
  hasNoRecords: boolean = true;
  hasNonSelected: boolean = true;
  min: Date;
  // max: Date;
  frommax: Date;
  excelDataArr: Array<any>;
  accessArr: Array<any> = []; // List of menuaccess
  custid = 0;
  airlineid = 0;
  customerGstNos: Array<any>;
  // Source for Datatable
  source: LocalDataSource = new LocalDataSource();
  date = new Date();
  loading = false;

  // Declare setting for datatable
  settings = {
    selectMode: 'multi',
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
        { name: 'download', title: '<i class="far fa-arrow-alt-circle-down" title="Download"></i>' },
      ],
      position: 'right',
    },
    pager: {
      display: true,
      perPage: this.defaultRowPerPage,
    },
    columns: {
      airlineCode: {
        title: 'Airline Code',
        type: 'string',
        filter: false,
      },
      ticketNo: {
        title: 'Ticket No',
        type: 'string',
        filter: false,
      },
      doi: {
        title: 'Date Of Issue',
        type: 'string',
        filter: false,
        valuePrepareFunction: (date) => {
          return moment(date).format('DD MMM YYYY');
        },
      },
      pnrNo: {
        title: 'PNR No',
        type: 'string',
        filter: false,
      },
      customerName: {
        title: 'Customer Name',
        type: 'string',
        filter: false,
      },
      customerGSTNo: {
        title: 'Customer GST No',
        type: 'string',
        filter: false,
      },
      transType: {
        title: 'Transaction Type',
        type: 'string',
        filter: false,
      },
      transNo: {
        title: 'Transaction No',
        type: 'string',
        filter: false,
      },
      transDate: {
        title: 'Transaction Date',
        type: 'string',
        filter: false,
        valuePrepareFunction: (date) => {
          return moment(date).format('DD MMM YYYY');
        },
      },
      passengerName: {
        title: 'Passenger Name',
        type: 'string',
        filter: false,
      },
      taxableAmt: {
        title: 'Taxable Amount',
        type: 'string',
        filter: false,
      },
      gstAmt: {
        title: 'GST Amount',
        type: 'string',
        filter: false,
      },
      totalAmt: {
        title: 'Total Amount',
        type: 'string',
        filter: false,
      },
    },
  };

  constructor(private gstinfoservice: GstInfoService,
    private airservice: AirlineService,
    private _auth: AuthenticationService,
    private _router: Router,
    private commservice: CommonService,
    private accservice: AccountsService,
    private formBuilder: FormBuilder,
    protected dateService: NbDateService<Date>,
    private commonfunction: CommonFunction,
  ) {
  }

  ngOnInit(): void {
    this.min = this.dateService.today();
    // this.max = this.dateService.addMonth(this.min, 1);
    this.frommax = this.dateService.today();
    this.custid = this._auth.getCustId();
    this.airlineid = this._auth.getAirlineId();

    this.accservice.getGetUserActions(this._auth.getUserId()).subscribe(
      (data) => {
        if (data['message'] === 'Success') {
          this.accessArr = data['payload'];
          if (this.accessArr.filter(t => t.actionName === 'List'
            && (t.module === 'Download Document' || t.module === 'Uploaded Documents')).length > 0) {
            this.getVerfAirListData();
          } else {
            const message = '401 Unauthorized page: GST Document Download';
            this.commonfunction.ErrorLogHdlFunc(message, this._auth.getUserId());
            this._router.navigate(['unauthorized']);
          }

        }
      });


    this.gstdownloadForm = this.formBuilder.group({
      AirlineCode: [''],
      TransactionType: [''],
      TicketNo: [''],
      PNRNo: [''],
      PassengerName: [''],
      CustomerGSTNo: ['',
        [Validators.pattern('^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$')]],
      FromTransDate: [this.dateService.getMonthStart(this.min)],
      // ToTransDate: [this.dateService.addMonth(this.dateService.today(), 1)],
      ToTransDate: [this.dateService.today()],
    },
    );

    // to get the customer GST Nos
    if (this.custid > 0) {
      this.gstinfoservice.getCustomerGstStates(this._auth.getUserId()).subscribe(
        (data) => {
          if (data['message'] === 'Success') {
            const gstList = data['payload'];
            if (gstList.length > 0) {
              this.customerGstNos = gstList;
            }
          }
        });
    }

    // to get the documents which are uploaded on current month

    this.getGstInfoData();
  }

  ngDoCheck() {
    this.totalRows = this.source != null ? this.source.count() : null;
  }

  // Filter Search datatable
  onSearch(query: string = '') {
    if (query === '') {
      this.source.reset();
    } else {
      this.source.setFilter([
        // fields we want to include in the search
        {
          field: 'airlineCode',
          search: query,
        },
        {
          field: 'ticketNo',
          search: query,
        },
        {
          field: 'doi',
          search: query,
        },
        {
          field: 'pnrNo',
          search: query,
        },
        {
          field: 'customerName',
          search: query,
        },
        {
          field: 'customerGSTNo',
          search: query,
        },
        {
          field: 'transType',
          search: query,
        },
        {
          field: 'transNo',
          search: query,
        },
        {
          field: 'transDate',
          search: query,
        },
        {
          field: 'passengerName',
          search: query,
        },
        {
          field: 'taxableAmt',
          search: query,
        },
        {
          field: 'gstAmt',
          search: query,
        },
        {
          field: 'totalAmt',
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
      case 'download':
        this.onDownload(event.data);
        break;
    }
  }
  public onDownload(formData: any) {
    let id: number = 0;
    id = formData['infoId'];

    const objmain: GstInfoDownloadRequest = new GstInfoDownloadRequest();
    const infoid: Array<number> = [];
    infoid.push(id);
    objmain.infoId = infoid;
    objmain.UserId = this._auth.getUserId();
    objmain.AirlineCode = this.gstdownloadForm.controls['AirlineCode'].value;
    // Pending : Call download pdf api
    this.gstinfoservice.getPdfFile(objmain).subscribe(
      (data) => {
        if (data['isError'] === false && data['code'] === 200) {
          const filename = data['payload'];

          FileSaver.saveAs(filename, 'Gst_PDF.zip');
        }
      },
    );
  }

  onRowSelect(event) {
    this.selectedRows = event.selected;
    if (this.selectedRows.length > 0) {
      this.hasNonSelected = false;
    } else {
      this.hasNonSelected = true;
    }
  }

  get f() { return this.gstdownloadForm.controls; }

  onSearchForm() {
    this.submitted = true;
    if (this.gstdownloadForm.valid) {
      this.getGstInfoData();
    }
  }

  onReset() {
    this.submitted = false;
    this.getVerfAirListData();
    this.gstdownloadForm.get('TransactionType').setValue('');
    this.gstdownloadForm.get('TicketNo').setValue('');
    this.gstdownloadForm.get('PNRNo').setValue('');
    this.gstdownloadForm.get('PassengerName').setValue('');
    this.gstdownloadForm.get('CustomerGSTNo').setValue('');
    this.gstdownloadForm.get('FromTransDate').setValue(this.dateService.getMonthStart(this.min));
    this.gstdownloadForm.get('ToTransDate').setValue(this.dateService.today());
    this.min = this.dateService.today();
    // this.max = this.dateService.addMonth(this.min, 1);
    this.gstdataArr = [];
    this.source.load(this.gstdataArr);
    this.source.count();
    this.hasNoRecords = true;
    this.hasNonSelected = true;
  }

  onExcel() {
    const objmain: GstInfoDownloadRequest = new GstInfoDownloadRequest();
    const infoid: Array<number> = [];
    for (let i = 0; i < this.gstdataArr.length; i++) {
      infoid.push(this.gstdataArr[i]['infoId']);
    }
    objmain.infoId = infoid;
    objmain.AirlineCode = this.gstdownloadForm.controls['AirlineCode'].value;

    this.gstinfoservice.getGstExcelResponse(objmain).subscribe(
      (data) => {
        if (data['isError'] === false && data['code'] === 200) {
          this.excelDataArr = data['payload'];

          const objULog: UserLog = new UserLog();
          objULog.Action = 'GST Documents';
          objULog.UserId = this._auth.getUserId();
          objULog.PageName = 'downloaddoc';
          objULog.Notes = 'GST Documents Export to Excel';

          this.commservice.insertUserLog(objULog).subscribe(data3 => {
            // do something, success
          }, error => { alert(error); });

          // Excel download
          if (this.excelDataArr.length > 0) {
            const fileName = 'Gst_Data_Excel.xlsx';
            const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.excelDataArr);
            const wb: XLSX.WorkBook = XLSX.utils.book_new();
            ws.A1.v = 'Airline Code';
            ws.B1.v = 'Ticket No';
            ws.C1.v = 'Date Of Issue';
            ws.D1.v = 'PNR No';
            ws.E1.v = 'Customer GST No';
            ws.F1.v = 'Transaction Type';
            ws.G1.v = 'Transaction No';
            ws.H1.v = 'Transaction Date';
            ws.I1.v = 'Passenger Name';
            ws.J1.v = 'Taxable Amount';
            ws.K1.v = 'GST Amount';
            ws.L1.v = 'Total Amount';
            XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
            XLSX.writeFile(wb, fileName);
          }
        } else {
          this.excelDataArr = [];
        }
      },
    );
  }

  onPdf() {
    // Pending : Call download pdf api
    const objmain: GstInfoDownloadRequest = new GstInfoDownloadRequest();
    const infoid: Array<number> = [];
    for (let i = 0; i < this.selectedRows.length; i++) {
      infoid.push(this.selectedRows[i]['infoId']);
    }
    objmain.infoId = infoid;
    objmain.UserId = this._auth.getUserId();
    objmain.AirlineCode = this.gstdownloadForm.controls['AirlineCode'].value;
    // Pending : Call download pdf api
    this.gstinfoservice.getPdfFile(objmain).subscribe(
      (data) => {
        if (data['isError'] === false && data['code'] === 200) {
          const filename = data['payload'];

          FileSaver.saveAs(filename, 'Gst_PDF.zip');
        }
      },
    );
  }

  onItemSelected(event) {
    this.getTTypeListData(event);
  }

  fromdatechange(event) {
    this.min = this.dateService.clone(event);
    // this.max = this.dateService.addMonth(this.min, 1);
    this.gstdownloadForm.get('ToTransDate').clearValidators();
    this.gstdownloadForm.get('ToTransDate').updateValueAndValidity();
    this.gstdownloadForm.get('ToTransDate').setValue(this.dateService.today());
    // this.gstdownloadForm.get('ToTransDate').setValue(this.dateService.addMonth(this.min, 1));
  }

  getVerfAirListData() {

    this.gstinfoservice.getVerfAirList(this.custid).subscribe(
      (data) => {
        if (data['isError'] === false && data['code'] === 200) {
          this.airlineArr = data['payload'];
          this.gstdownloadForm.get('AirlineCode').setValue(this.airlineArr.map(t => t.airlineCode)[0]);
          if (this.custid === 0 && this.airlineid > 0) {
            this.getTTypeListData(this.airlineid);
          } else if (this.airlineArr.length > 0) { this.getTTypeListData(this.airlineArr.map(t => t.airlineId)[0]); }

        } else {
          this.airlineArr = [];
        }
      },
    );
  }

  getTTypeListData(airid: number) {
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

  // Get Airline Master Data
  getGstInfoData() {
    this.loading = true;
    const objmain: GstInfoRequest = new GstInfoRequest();
    objmain.UserId = this._auth.getUserId();
    const ac = this.gstdownloadForm.controls['AirlineCode'].value;
    objmain.AirlineCode = ac === undefined ? '' : ac;
    objmain.TransactionType = (this.gstdownloadForm.controls['TransactionType'].value !== '' ?
      this.gstdownloadForm.controls['TransactionType'].value : 0);
    objmain.TicketNo = this.gstdownloadForm.controls['TicketNo'].value;
    objmain.PNRNo = this.gstdownloadForm.controls['PNRNo'].value;
    objmain.PassengerName = this.gstdownloadForm.controls['PassengerName'].value;
    objmain.CustomerGSTNo = this.gstdownloadForm.controls['CustomerGSTNo'].value;

    const fromdate = this.gstdownloadForm.controls['FromTransDate'].value;
    const todate = this.gstdownloadForm.controls['ToTransDate'].value;

    const fyear = new Date(fromdate).getFullYear();
    const fmonth = new Date(fromdate).getMonth() + 1;
    const fday = new Date(fromdate).getDate();
    objmain.FromTransDate = fyear + '-' + fmonth + '-' + fday + ' ' + '00:00:00';

    const tyear = new Date(todate).getFullYear();
    const tmonth = new Date(todate).getMonth() + 1;
    const tday = new Date(todate).getDate();
    objmain.ToTransDate = tyear + '-' + tmonth + '-' + tday + ' ' + '23:59:00';
    objmain.AirlineId = this.airlineid;
    objmain.CustId = this.custid;
    this.gstinfoservice.getGstSearchResponse(objmain).subscribe(
      (data) => {
        if (data['isError'] === false && data['code'] === 200) {
          this.gstdataArr = data['payload'];
          const objULog: UserLog = new UserLog();
          objULog.Action = 'GST Documents';
          objULog.UserId = this._auth.getUserId();
          objULog.PageName = 'downloaddoc';
          objULog.Notes = 'GST Documents';

          this.commservice.insertUserLog(objULog).subscribe(data3 => {
            // do something, success
          }, error => { alert(error); });

          if (this.gstdataArr !== undefined && this.gstdataArr.length > 0) {
            this.hasNoRecords = false;
          }
          this.loading = false;

        } else {
          this.gstdataArr = [];
          this.hasNoRecords = true;
          this.loading = false;
        }

        // Bind data to Datatable
        this.source.load(this.gstdataArr);
        this.source.count();
      },
    );
  }

}
