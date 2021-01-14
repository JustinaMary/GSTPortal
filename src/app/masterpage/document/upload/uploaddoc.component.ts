import { Component, OnInit, DoCheck } from '@angular/core';
import { CommonFunction } from '../../../common/common-functions';
import { GstInfoService } from '../../../services/gstinfo.service';
import { LocalDataSource } from 'ng2-smart-table';
import { AuthenticationService } from '../../../services/authentication.service';
import { AccountsService } from '../../../services/accounts.service';
import { Router } from '@angular/router';

interface TreeNode<T> {
  data: T;
  children?: TreeNode<T>[];
  expanded?: boolean;
}

interface FSEntry {
  message: string;
  kind: string;
  items?: number;
}

@Component({
  selector: 'ngx-uploaddoc',
  templateUrl: './uploaddoc.component.html',
  styleUrls: ['./uploaddoc.component.scss'],
})
export class UploadDocComponent implements OnInit, DoCheck {
  accessArr: Array<any> = []; // List of menuaccess


  constructor(private commonfunction: CommonFunction,
    private gstService: GstInfoService,
    private accservice: AccountsService,
    private _router: Router,
    private _auth: AuthenticationService) {

  }

  allColumns = ['message', 'items'];
  responseArray: Array<any> = []; // List of messages
  files: any[] = [];
  data: TreeNode<FSEntry>[] = [];
  isDisabled = true;
  messageArray: TreeNode<FSEntry>[] = [];
  errorArray: TreeNode<FSEntry>[] = [];
  messages: Array<any> = [];
  errors: Array<any> = [];
  // Source for Datatable
  source: LocalDataSource = new LocalDataSource();
  defaultRowPerPage = 10;
  totalRows = 0;
  loading = false;
  // Declare setting for datatable
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
      // srno: {
      //   title: 'Sr No.',
      //   type: 'number',
      //   valuePrepareFunction: (value, row, cell) => {
      //     return (cell.row.index + 1); // Increment rows
      //    },
      // },
      ticketNo: {
        title: 'Ticket No',
        type: 'string',
        filter: false,
      },
      pnrNo: {
        title: 'PNR No',
        type: 'string',
        filter: false,
      },
      customerGSTNo: {
        title: 'Customer GST No',
        type: 'string',
        filter: false,
      },
      transTypeStr: {
        title: 'Transaction Type',
        type: 'string',
        filter: false,
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

  ngOnInit(): void {
    this.accservice.getGetUserActions(this._auth.getUserId()).subscribe(
      (data) => {
        if (data['message'] === 'Success') {
          this.accessArr = data['payload'];
          if (this.accessArr.filter(t => t.actionName === 'List' && t.module === 'Upload Document').length > 0) {

          } else {
            const message = '401 Unauthorized page: GST Document Upload';
            this.commonfunction.ErrorLogHdlFunc(message, this._auth.getUserId());
            this._router.navigate(['unauthorized']);
          }

        }
      });


  }

  ngDoCheck() {
    this.totalRows = this.source != null ? this.source.count() : null;
  }

  // Set Datatable pager
  setPager() {
    this.source.setPaging(1, this.defaultRowPerPage, true);
    this.settings = Object.assign({}, this.settings);
  }

  assignValue() {
    this.messages = this.responseArray['msgResponses'].filter(t => t.isError === false);
    this.errors = this.responseArray['msgResponses'].filter(t => t.isError === true);
    for (let j = 0; j < this.messages.length; j++) {
      const object = { data: { message: this.messages[j]['message'], kind: 'msg' } };
      this.messageArray.push(object);
    }
    if (this.errors) {
      for (let j = 0; j < this.errors.length; j++) {
        const object = { data: { message: this.errors[j]['message'], kind: 'msg' } };
        this.errorArray.push(object);
      }
    }
    this.showMessasgeTable();
  }

  showMessasgeTable() {
    this.data = [
      {
        data: { message: 'Errors', kind: 'show', items: this.errorArray.length },
        children:
          this.errorArray,
      },
      {
        data: { message: 'Message', kind: 'show', items: this.messageArray.length },
        children:
          this.messageArray,
      },
    ];
  }


  /**
   * on file drop handler
   */
  onFileDropped($event) {
    this.prepareFilesList($event);
  }

  /**
   * handle file from browsing
   */
  fileBrowseHandler(files) {
    this.prepareFilesList(files);
  }

  /**
   * Delete file from files list
   * @param index (File index)
   */
  deleteFile(index: number) {
    this.files.splice(index, 1);
    this.isDisabled = true;
  }

  /**
   * Simulate the upload process
   */
  uploadFilesSimulator(index: number) {
    setTimeout(() => {
      if (index === this.files.length) {
        return;
      } else {
        const progressInterval = setInterval(() => {
          if (this.files[index].progress === 100) {
            clearInterval(progressInterval);
            this.uploadFilesSimulator(index + 1);
            this.isDisabled = false;
          } else {
            this.files[index].progress += 5;
          }
        }, 200);
        // this.isDisabled = false;
      }
    }, 1000);
  }

  /**
   * Convert Files list to normal array list
   * @param files (Files List)
   */
  prepareFilesList(files: Array<any>) {
    if (this.files.length === 0 && files.length === 1) {
      this.responseArray = [];
      this.messageArray = [];
      this.errorArray = [];
      this.data = [];
      this.source = new LocalDataSource();
      for (const item of files) {
        if (item['name'].toLocaleLowerCase().indexOf('.zip') !== -1) {
          item.progress = 0;
          this.files.push(item);
          this.uploadFilesSimulator(0);
        } else {
          this.commonfunction.showToast('warning', 'Warning', 'Kindly upload .zip file.');
        }
      }

    } else {
      this.commonfunction.showToast('warning', 'Warning', 'Only one file can be uploaded.');
    }
  }

  /**
   * format bytes
   * @param bytes (File size in bytes)
   * @param decimals (Decimals point)
   */
  formatBytes(bytes, decimals) {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const dm = decimals <= 0 ? 0 : decimals || 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
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
          field: 'pnrNo',
          search: query,
        },
        {
          field: 'customerGSTNo',
          search: query,
        },
        {
          field: 'transTypeStr',
          search: query,
        },
      ], false);
    }
  }


  onSubmit() {
    if (this.files.length > 0) {
      this.isDisabled = true;
      this.loading = true;
      const userid = this._auth.getUserId();
      this.gstService.gstDocUpload(this.files[0], userid).subscribe(data => {
        if (data['isError'] === false && data['code'] === 200) {
          this.responseArray = data['payload'];
          this.commonfunction.showToast('success', 'Uploaded', 'Kindly check the response table for more details.');
          this.files = [];
          this.assignValue();

          this.source.load(this.responseArray['tableResponses']);
          this.source.count();
          this.loading = false;
        } else {
          this.errors.push(data['error']);
          for (let i = 0; i < this.errors.length; i++) {
            this.commonfunction.showToast('danger', 'Error', this.errors[i].value);
            this.files = [];
            this.errors = [];
          }
          this.loading = false;
        }

      }, error => { alert(error); });
    } else {
      this.commonfunction.showToast('danger', 'Error', 'Kindly upload the file.');
    }

  }
}
