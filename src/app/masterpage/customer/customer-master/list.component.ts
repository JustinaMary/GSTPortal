import { Component, OnInit, DoCheck } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CustomerService } from '../../../services/customer.service';
import { AuthenticationService } from '../../../services/authentication.service';
import { CommonFunction } from '../../../common/common-functions';
import { UserLog } from '../../../models/common-model';
import { CommonService } from '../../../services/common.service';
import { AccountsService } from '../../../services/accounts.service';


@Component({
  selector: 'ngx-list-customerregisterrequest',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})

export class CListComponent implements OnInit, DoCheck {
  defaultRowPerPage = 10;
  SerachValue = '';
  totalRows = 0;
  Swal = require('sweetalert2');
  custArr: Array<any> = []; // List of custRequest
  airlineId = 0;
  accessArr: Array<any> = []; // List of menuaccess


  // Source for Datatable
  source: LocalDataSource = new LocalDataSource();

  // Declare setting for datatable
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
        { name: 'edit', class: 'ng2-smart-actions: ng-star-inserted', title: '<i class="nb-edit" title="Edit"></i>' },
        { name: 'delete', title: '<i class="nb-trash" title="Delete"></i>' },
      ],
      position: 'right',
    },
    pager: {
      display: true,
      perPage: this.defaultRowPerPage,
    },
    columns: {
      // srno: {
      //   title: 'Sr No.',
      //   type: 'number',
      //   valuePrepareFunction: (value, row, cell) => {
      //     return (cell.row.index + 1); // Increment rows
      //    },
      // },
      customerName: {
        title: 'Customer Name',
        type: 'string',
        filter: false,
      },
      airlineName: {
        title: 'Airline Name',
        type: 'string',
        filter: false,
      },
      // ticketNo: {
      //   title: 'Ticket No',
      //   type: 'string',
      //   filter: false,
      // },
      panNo: {
        title: 'Pan No',
        type: 'string',
        filter: false,
      },
      email: {
        title: 'Email',
        type: 'string',
        filter: false,
      },
      // status: {
      //   title: 'Status',
      //   type: 'string',
      //   filter: false,
      // },
      status: {
        title: 'Request Status',
        type: 'string',
        filter: false,
        valuePrepareFunction: (row) => {
          return (row === 2 ? 'New' : row === 3 ? 'Verified' : 'Not-Verified');
        },
      },
      // createdDate: {
      //   title: 'Customer Verify?',
      //   type: 'string',
      //   filter: false,
      //   valuePrepareFunction: (row) => {
      //     return (row === true ? 'Yes' : 'No');
      //   },
      // },
    },
  };

  constructor(private custservice: CustomerService,
    private _router: Router,
    private _auth: AuthenticationService,
    private commonfunction: CommonFunction,
    private commservice: CommonService,
    private accservice: AccountsService,
  ) {
  }

  ngOnInit(): void {

    this.airlineId = this._auth.getAirlineId();

    this.accservice.getGetUserActions(this._auth.getUserId()).subscribe(
      (data) => {
        if (data['message'] === 'Success') {
          this.accessArr = data['payload'];
          if (this.accessArr.filter(t => t.actionName === 'List' && t.module === 'Customer Request').length > 0) {
            this.getCustomerList();
          } else {
            const message = '401 Unauthorized page: Customer Request List';
            this.commonfunction.ErrorLogHdlFunc(message, this._auth.getUserId());
            this._router.navigate(['unauthorized']);
          }

          if (this.accessArr.filter(t => t.actionName === 'Update' && t.module === 'Customer Request').length === 0) {
            const item = this.settings.actions.custom.findIndex((t => t.name === 'edit'));
            this.settings.actions.custom.splice(item, 1);
          }
          if (this.accessArr.filter(t => t.actionName === 'Delete' && t.module === 'Customer Request').length === 0) {
            const item2 = this.settings.actions.custom.findIndex((t => t.name === 'delete'));
            this.settings.actions.custom.splice(item2, 1);
          }

          this.settings = Object.assign({}, this.settings);

        }
      });
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
          field: 'customerName',
          search: query,
        },
        {
          field: 'airlineName',
          search: query,
        },
        {
          field: 'email',
          search: query,
        },
        {
          field: 'panNo',
          search: query,
        },
        // {
        //   field: 'status',
        //   search: query,
        // },
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
      case 'delete':
        this.onDelete(event.data);
    }
  }
  public onEdit(formData: any) {
    if (this.accessArr.filter(t => t.actionName === 'Update' && t.module === 'Customer Request').length === 0) {
      this.commonfunction.showToast('danger', 'Failed', 'Access Denied');
    } else {
      let id: number = 0;
      let idstr: string = '';
      id = formData['reqId'];
      const obj = {
        reqId: id,
      };
      idstr = this._auth.encryptData(obj);
      this._router.navigate(['customerRequestDetail/' + idstr]);
    }

  }
  public onDelete(formData: any) {
    if (this.accessArr.filter(t => t.actionName === 'Delete' && t.module === 'Customer Request').length === 0) {
      this.commonfunction.showToast('danger', 'Failed', 'Access Denied');
    } else {
      Swal.fire({
        title: 'Are you sure?',
        text: 'Once deleted, you will not be able to recover this!',
        icon: 'warning',
        showCancelButton: true,
      }).then((result) => {
        if (result.value) {

          let id: number = 0;
          id = formData['reqId'];
          this.custservice.custRegisterRequestDel(id).subscribe(
            (data) => {
              if (data['isError'] === false && data['code'] === 200) {
                if (data['message'] === 'Success') {
                  this.source.remove(formData);
                  this.commonfunction.showToast('success', 'Success', 'Record successfully deleted');
                } else {
                  this.commonfunction.showToast('danger', 'Failed', 'Record not deleted');
                }
              }
            },
          );

        }
      });
    }
  }

  // Add new button click
  onAdd(): void {
    if (this.accessArr.filter(t => t.actionName === 'Create' && t.module === 'Customer Request').length === 0) {
      this.commonfunction.showToast('danger', 'Failed', 'Access Denied');
    } else {
      this._router.navigate(['requestCreate']);
    }

  }

  // Get Customer Master Data
  getCustomerList() {
    this.custservice.getCustomerRequest(0).subscribe(
      (data) => {
        if (data['isError'] === false && data['code'] === 200) {
          this.custArr = data['payload'];

          const objULog: UserLog = new UserLog();
          objULog.Action = 'Customer Register Request List';
          objULog.UserId = this._auth.getUserId();
          objULog.PageName = 'customerList';
          objULog.Notes = 'Customer Register Request List';

          this.commservice.insertUserLog(objULog).subscribe(data3 => {
            // do something, success
          }, error => { alert(error); });



        } else {
          this.custArr = [];
        }
        // Bind data to Datatable
        this.source.load(this.custArr);
        this.source.count();
      },
    );
  }

}
