import { Component, OnInit, DoCheck } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { Router } from '@angular/router';
// import Swal from 'sweetalert2';
import { AuthenticationService } from '../../services/authentication.service';
import { UserLog } from '../../models/common-model';
import { CommonService } from '../../services/common.service';
import { AccountsService } from '../../services/accounts.service';
import { CommonFunction } from '../../common/common-functions';


@Component({
  selector: 'ngx-menumaster',
  templateUrl: './menumaster.component.html',
  styleUrls: ['./menumaster.component.scss'],
})

export class MenuMasterComponent implements OnInit, DoCheck {
  defaultRowPerPage = 10;
  SerachValue = '';
  totalRows = 0;
  Swal = require('sweetalert2');
  menuArr: Array<any> = []; // List of menu
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
        { name: 'edit', title: '<i class="nb-edit" title="Edit"></i>' },
        // { name: 'delete', title: '<i class="nb-trash" title="Delete"></i>' },
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
        title: 'Module',
        type: 'string',
        filter: false,
      },
      category: {
        title: 'Category',
        type: 'string',
        filter: false,
      },

    },
  };

  constructor(
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
          if (this.accessArr.filter(t => t.actionName === 'List' && t.module === 'System Module').length > 0) {
            this.getMenuMasterList();
          } else {
            const message = '401 Unauthorized page: Menu Master List';
            this.commonfunction.ErrorLogHdlFunc(message, this._auth.getUserId());
            this._router.navigate(['unauthorized']);
          }
          const rolename = this._auth.getRoleName();
          if (rolename === 'Airline Admin' || rolename === 'Customer Admin') {

          } else {
            const item = this.settings.actions.custom.findIndex((t => t.name === 'edit'));
            this.settings.actions.custom.splice(item, 1);
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
          field: 'category',
          search: query,
        },
        {
          field: 'name',
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
      // case 'delete':
      //   this.onDelete(event.data);
    }
  }
  public onEdit(formData: any) {
    let id: number = 0;
    let idstr: string = '';
    id = formData['id'];
    const obj = {
      id: id,
    };
    idstr = this._auth.encryptData(obj);
    this._router.navigate(['menuAction/' + idstr]);


  }
  // public onDelete(formData: any) {
  //   Swal.fire({
  //     title: 'Are you sure?',
  //     text: 'Once deleted, you will not be able to recover this!',
  //     icon: 'warning',
  //     showCancelButton: true,
  //   }).then((result) => {
  //     if (result.value) {

  //       let id: number = 0;
  //       id = formData['reqId'];
  //       this.custservice.custRegisterRequestDel(id).subscribe(
  //         (data) => {
  //           if (data['isError'] === false && data['code'] === 200) {
  //             if (data['message'] === 'Success') {
  //               this.source.remove(formData);
  //               this.commonfunction.showToast('success', 'Success', 'Record successfully deleted');
  //             } else {
  //               this.commonfunction.showToast('danger', 'Failed', 'Record not deleted');
  //             }
  //           }
  //         },
  //       );

  //     }
  //   });
  // }

  // Add new button click
  // onAdd(): void {
  //   this._router.navigate(['requestCreate']);
  // }

  // Get Customer Master Data
  getMenuMasterList() {

    const airlineId = this._auth.getAirlineId();
    const custId = this._auth.getCustId();
    this.commservice.getMenuMasterList(airlineId, custId).subscribe(
      (data) => {
        if (data['isError'] === false && data['code'] === 200) {
          this.menuArr = data['payload'];

          const objULog: UserLog = new UserLog();
          objULog.Action = 'Menu Master List';
          objULog.UserId = this._auth.getUserId();
          objULog.PageName = 'menuMaster';
          objULog.Notes = 'Menu Master List';

          this.commservice.insertUserLog(objULog).subscribe(data3 => {
            // do something, success
          }, error => { alert(error); });

        } else {
          this.menuArr = [];
        }
        // Bind data to Datatable
        this.source.load(this.menuArr);
        this.source.count();
      },
    );
  }

}
