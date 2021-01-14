import { Component, OnInit, DoCheck } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AirlineService } from '../../../services/airline.service';
import { AuthenticationService } from '../../../services/authentication.service';
import { CommonFunction } from '../../../common/common-functions';
import { UserLog } from '../../../models/common-model';
import { CommonService } from '../../../services/common.service';
import { AccountsService } from '../../../services/accounts.service';

@Component({
  selector: 'ngx-list-airline',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit, DoCheck {
  defaultRowPerPage = 10;
  SerachValue = '';
  totalRows = 0;
  Swal = require('sweetalert2');
  airlineArr: Array<any> = []; // List of airlines
  accessArr: Array<any> = []; // List of menuactions

  userAction: Array<any> = [];
  // Source for Datatable
  source: LocalDataSource = new LocalDataSource();
  constructor(private airservice: AirlineService,
    private _router: Router,
    private _auth: AuthenticationService,
    private commonfunction: CommonFunction,
    private commservice: CommonService,
    private accservice: AccountsService,
  ) {
  }

  ngOnInit(): void {
    this.accservice.getGetUserActions(this._auth.getUserId()).subscribe(
      (data) => {
        if (data['message'] === 'Success') {
          this.accessArr = data['payload'];
          if (this.accessArr.filter(t => t.actionName === 'List' && t.module === 'Airline Master').length > 0) {
            this.getAirlineData();
          } else {
            const message = '401 Unauthorized page: Airline Master List';
            this.commonfunction.ErrorLogHdlFunc(message, this._auth.getUserId());
            this._router.navigate(['unauthorized']);
          }

          if (this.accessArr.filter(t => t.actionName === 'Update' && t.module === 'Airline Master').length === 0) {
            // this.settings.actions.custom.push({ name: 'edit', title: '<i class="nb-edit" title="Edit"></i>' });
            const item = this.settings.actions.custom.findIndex((t => t.name === 'edit'));
            this.settings.actions.custom.splice(item, 1);
          }
          if (this.accessArr.filter(t => t.actionName === 'Delete' && t.module === 'Airline Master').length === 0) {
            // this.settings.actions.custom.push({ name: 'delete', title: '<i class="nb-trash" title="Delete"></i>' });
            const item2 = this.settings.actions.custom.findIndex((t => t.name === 'delete'));
            this.settings.actions.custom.splice(item2, 1);
          }
          // if (this.settings.actions.custom.length == 0) {
          //   this.settings.actions.custom = null;
          // }
          // debugger;
          this.settings = Object.assign({}, this.settings);

        }
      });
      // this.source.onChanged().subscribe((change) => {
      //   debugger;
      // });
    }

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
        { name: 'edit', title: '<i class="nb-edit" title="Edit"></i>' },
        { name: 'delete', title: '<i class="nb-trash" title="Delete"></i>' },
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
      airlineName: {
        title: 'Airline',
        type: 'string',
        filter: false,
      },
      airlineCode: {
        title: 'Airline Code',
        type: 'string',
        filter: false,
      },
      customerVerify: {
        title: 'Customer Verify?',
        type: 'string',
        filter: false,
        valuePrepareFunction: (row) => {
          return (row === true ? 'Yes' : 'No');
        },
      },
    },
  };

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
          field: 'airlineName',
          search: query,
        },
        {
          field: 'airlineCode',
          search: query,
        },
        {
          field: 'customerVerify',
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
      case 'delete':
        this.onDelete(event.data);
    }
  }
  public onEdit(formData: any) {
    if (this.accessArr.filter(t => t.actionName === 'Update' && t.module === 'Airline Master').length === 0) {
      this.commonfunction.showToast('danger', 'Failed', 'Access Denied');
    } else {
      let id: number = 0;
      let idstr: string = '';
      id = formData['airlineId'];
      const obj = {
        airlineId: id,
      };
      idstr = this._auth.encryptData(obj);
      this._router.navigate(['airlineEdit/' + idstr]);

    }
  }
  public onDelete(formData: any) {
    if (this.accessArr.filter(t => t.actionName === 'Delete' && t.module === 'Airline Master').length === 0) {
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
          id = formData['airlineId'];
          this.airservice.AirlineMasterDel(id).subscribe(
            (data) => {
              if (data['isError'] === false && data['code'] === 200) {
                if (data['message'] === 'Success') {
                  const objULog: UserLog = new UserLog();
                  objULog.Action = 'Airline Master Delete';
                  objULog.UserId = this._auth.getUserId();
                  objULog.PageName = 'airlineList';
                  objULog.Notes = 'airlineId=' + id;

                  this.commservice.insertUserLog(objULog).subscribe(data3 => {
                    // do something, success
                  }, error => { alert(error); });
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
    if (this.accessArr.filter(t => t.actionName === 'Create' && t.module === 'Airline Master').length === 0) {
      this.commonfunction.showToast('danger', 'Failed', 'Access Denied');
    } else {
      this._router.navigate(['airlineCreate']);
    }
  }

  // Get Airline Master Data
  getAirlineData() {
    this.airservice.getAirlineMasterList(0).subscribe(
      (data) => {
        if (data['isError'] === false && data['code'] === 200) {
          this.airlineArr = data['payload'];

          const objULog: UserLog = new UserLog();
          objULog.Action = 'Airline Master List';
          objULog.UserId = this._auth.getUserId();
          objULog.PageName = 'airlineList';
          objULog.Notes = 'Airline Master List';

          this.commservice.insertUserLog(objULog).subscribe(data3 => {
            // do something, success
          }, error => { alert(error); });
        } else {
          this.airlineArr = [];
        }
        // Bind data to Datatable
        this.source.load(this.airlineArr);
        this.source.count();
      },
    );
  }

}
