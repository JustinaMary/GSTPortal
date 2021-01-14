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
  selector: 'ngx-list-user-airline',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class UserListComponent implements OnInit, DoCheck {
  defaultRowPerPage = 10;
  SerachValue = '';
  totalRows = 0;
  Swal = require('sweetalert2');
  airlineUserArr: Array<any> = []; // List of airline States
  airid = 0;
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
      name: {
        title: 'Name',
        type: 'string',
        filter: false,
      },
      airlineName: {
        title: 'Airline',
        type: 'string',
        filter: false,
      },
      contactNo: {
        title: 'Contact No',
        type: 'string',
        filter: false,
      },
      roleName: {
        title: 'Role',
        type: 'string',
        filter: false,
      },
    },
  };

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
    this.airid = this._auth.getAirlineId();

    this.accservice.getGetUserActions(this._auth.getUserId()).subscribe(
      (data) => {
        if (data['message'] === 'Success') {
          this.accessArr =  data['payload'];
          if (this.accessArr.filter(t => t.actionName === 'List' && t.module === 'Airline Users').length > 0) {
            this.getAirlineUserData(this.airid);
          } else {
            const message = '401 Unauthorized page: Airline Users List';
            this.commonfunction.ErrorLogHdlFunc(message, this._auth.getUserId());
            this._router.navigate(['unauthorized']);
          }

          if (this.accessArr.filter(t => t.actionName === 'Update' && t.module === 'Airline Users').length === 0) {
            const item = this.settings.actions.custom.findIndex((t => t.name === 'edit'));
            this.settings.actions.custom.splice(item, 1);
          }
          if (this.accessArr.filter(t => t.actionName === 'Delete' && t.module === 'Airline Users').length === 0) {
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
          field: 'name',
          search: query,
        }, {
          field: 'airlineName',
          search: query,
        },
        {
          field: 'contactNo',
          search: query,
        },
        {
          field: 'roleName',
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
    let id: number = 0;
    let idstr: string = '';
    id = formData['airUserId'];
    const obj = {
      airUserId : id,
    };
    idstr = this._auth.encryptData(obj);
    this._router.navigate(['airlineUserEdit/' + idstr]);
  }
  public onDelete(formData: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Once deleted, you will not be able to recover this!',
      icon: 'warning',
      showCancelButton: true,
    }).then((result) => {
      if (result.value) {
        let id: number = 0;
        id = formData['airUserId'];
        this.airservice.AirlineUserDel(id).subscribe(
          (data) => {
            if (data['isError'] === false && data['code'] === 200) {
              if (data['message'] === 'Success') {
                const objULog: UserLog = new UserLog();
                objULog.Action = 'Airline User Delete';
                objULog.UserId = this._auth.getUserId();
                objULog.PageName = 'airlineUserList';
                objULog.Notes = 'airUserId=' + id;

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

  onAdd(): void {
      if (this.accessArr.filter(t => t.actionName === 'Create' && t.module === 'Airline Users').length === 0) {
        this.commonfunction.showToast('danger', 'Failed', 'Access Denied');
      } else {
        this._router.navigate(['airlineUserCreate']);
      }
    }

  // Get Airline user Master Data
  getAirlineUserData(airid: number) {
    this.airservice.getAirlineUserMasterList(0, airid, '00000000-0000-0000-0000-000000000000').subscribe(
      (data) => {
        if (data['isError'] === false && data['code'] === 200) {
          this.airlineUserArr = data['payload'];
          const objULog: UserLog = new UserLog();
          objULog.Action = 'Airline User List';
          objULog.UserId = this._auth.getUserId();
          objULog.PageName = 'airlineUserList';
          objULog.Notes = 'Airline User List';

          this.commservice.insertUserLog(objULog).subscribe(data3 => {
            // do something, success
          }, error => { alert(error); });
        } else {
          this.airlineUserArr = [];
        }
        // Bind data to Datatable
        this.source.load(this.airlineUserArr);
        this.source.count();
      },
    );
  }

}
