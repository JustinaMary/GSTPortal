import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit, SecurityContext, ViewChild, ElementRef } from '@angular/core'; // , Input
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router'; // , ActivatedRoute

import { CustomerService } from '../../../services/customer.service';
import { CommonService } from '../../../services/common.service';
import { Validation, PANFormatValidator } from '../../../common/validation'; // GSTFormatValidator
import { Customer } from '../../../models/customer-model';
import { UserLog } from '../../../models/common-model';
import { AuthenticationService } from '../../../services/authentication.service';
import { CommonFunction } from '../../../common/common-functions';
import { AccountsService } from '../../../services/accounts.service';
import { NbDateService } from '@nebular/theme';
import { GstInfoService } from '../../../services/gstinfo.service';


@Component({
  selector: 'ngx-create-custregireq',
  templateUrl: './create.component.html',
})
export class CCreateComponent implements OnInit {
  custRegiReqForm: FormGroup;
  submitted = false;
  // title = '';
  // sub: any;
  fileToUploadPAN: File = null;
  fileToUploadGST: File = null;
  isDisabled = false;
  custid = 0;
  panLink = '';
  accessArr: Array<any> = []; // List of menuaccess
  customerGstNos: Array<any>;
  max: Date;
  fileExtensions = ['pdf', 'png', 'jpg'];
  loading = false;
  // to reset the file
  @ViewChild('panDoc') panDoc: ElementRef;
  @ViewChild('gstDoc') gstDoc: ElementRef;

  constructor(private formBuilder: FormBuilder,
    // private route: ActivatedRoute,
    private gstinfoservice: GstInfoService,
    private _router: Router,
    private custservice: CustomerService,
    private accservice: AccountsService,
    private commservice: CommonService,
    private _auth: AuthenticationService,
    private commonfunction: CommonFunction,
    private validation: Validation,
    private sanitizer: DomSanitizer, protected dateService: NbDateService<Date>) {
    this.max = this.dateService.today();
  }

  ngOnInit() {
    this.custRegiReqForm = this.formBuilder.group({
      CustomerName: ['', [Validators.required]],
      Email: ['', [Validators.required]],
      Mobile: ['', [Validators.required]],
      PANNo: ['', [Validators.required, PANFormatValidator]],
      // GSTNo: ['', [Validators.required, GSTFormatValidator]],
      GSTNo: ['', [Validators.required]],
      PNRNo: [''], // , [Validators.required]
      TicketNo: ['', [Validators.required, this.validation.IsAirlineExist]],
      DateofIssue: ['', [Validators.required]],
      Notes: [''],
      PanDoc: [''],
      GstDoc: ['', [Validators.required]],
    }, {
      validator: [
        this.validation.ticketAndGstCheckValidator('TicketNo', true),
        this.validation.ticketAndGstCheckValidator('GSTNo', false),
        this.validation.IsAirlineExist('TicketNo'),
      ],
    });

    // this.sub = this.route.params.subscribe(params => {

    // });
    this.custid = this._auth.getCustId();
    if (this.custid !== undefined || this.custid !== 0) {
      this.accservice.getGetUserActions(this._auth.getUserId()).subscribe(
        (data) => {
          if (data['message'] === 'Success') {
            this.accessArr = data['payload'];
            if (this.accessArr.filter(t => t.actionName === 'Create' && t.module === 'Customer Request').length > 0) {
              this.getCustomerData(this.custid);
            } else {
              const message = '401 Unauthorized page: Create Customer Register Request';
              this.commonfunction.ErrorLogHdlFunc(message, this._auth.getUserId());
              this._router.navigate(['unauthorized']);
            }

          }
        });

      // to get the customer GST Nos
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
  }

  get f() { return this.custRegiReqForm.controls; }
  registerCustomerRequest(): void {
    this.loading = true;
    // debugger;
    this.isDisabled = true;
    const objCustomer: Customer = new Customer();
    // objCustomer.CreatedBy = this._auth.getUserId();
    objCustomer.ReqId = 0;
    objCustomer.TicketNo = this.sanitizer.sanitize(SecurityContext.HTML,
      this.custRegiReqForm.controls['TicketNo'].value);
    objCustomer.PNR = this.sanitizer.sanitize(SecurityContext.HTML,
      this.custRegiReqForm.controls['PNRNo'].value);
    // objCustomer.DateofIssue = this.custRegiReqForm.controls['DateofIssue'].value;
    const date = this.custRegiReqForm.controls['DateofIssue'].value;
    const year = new Date(date).getFullYear();
    const month = new Date(date).getMonth() + 1;
    const day = new Date(date).getDate();
    objCustomer.DateofIssue = year + '-' + month + '-' + day + ' ' + '00:00:00';

    objCustomer.CustomerName = this.sanitizer.sanitize(SecurityContext.HTML,
      this.custRegiReqForm.controls['CustomerName'].value);
    objCustomer.PANNo = this.sanitizer.sanitize(SecurityContext.HTML,
      this.custRegiReqForm.controls['PANNo'].value);
    objCustomer.GstNo = this.sanitizer.sanitize(SecurityContext.HTML,
      this.custRegiReqForm.controls['GSTNo'].value);
    objCustomer.Email = this.sanitizer.sanitize(SecurityContext.HTML,
      this.custRegiReqForm.controls['Email'].value);
    objCustomer.Mobile = this.sanitizer.sanitize(SecurityContext.HTML,
      this.custRegiReqForm.controls['Mobile'].value);
    objCustomer.Status = 2; // new
    objCustomer.Notes = this.sanitizer.sanitize(SecurityContext.HTML,
      this.custRegiReqForm.controls['Notes'].value);

    this.custservice.customerRequestPost(objCustomer).subscribe(
      (data) => {
        if (data['isError'] === false && data['code'] === 200) {
          this.commonfunction.showToast('success', 'Success', 'Successfully saved');

          const reqId = data['payload'].reqId; // ranno_reqid_doctype_docpath
          let panFileName = Math.floor(1000 + Math.random() * 9000) + '_' + reqId + '_10.jpg';
          const gstFileName = Math.floor(1000 + Math.random() * 9000) + '_' + reqId + '_11.jpg';
          // debugger;
          if (this.fileToUploadPAN === null && this.panLink) {
            panFileName = Math.floor(1000 + Math.random() * 9000) + '_'
              + reqId + '_10_' + this.panLink.split('/').pop();
          }
          this.custservice.customerDocUpload(this.fileToUploadPAN, panFileName).subscribe(data2 => {
            // do something, if upload success // alert('fileresponce  come');
          }, error => { alert(error); });

          this.custservice.customerDocUpload(this.fileToUploadGST, gstFileName).subscribe(data3 => {
            // do something, if upload success // alert('fileresponce  come');
          }, error => { alert(error); });

          const objULog: UserLog = new UserLog();
          objULog.Action = 'Create Customer Register Request';
          objULog.UserId = this._auth.getUserId();
          objULog.PageName = 'Create Customer Register Request';
          objULog.Notes = 'Create New Customer Register Request';

          this.commservice.insertUserLog(objULog).subscribe(data3 => {
            // do something, success
          }, error => { alert(error); });


          setTimeout(() => {
            this._router.navigate(['customerList']);
          }, 1500);
        } else {
          this.commonfunction.showToast('danger', 'Failed', 'Not saved');
          this.isDisabled = false;
        }
        this.loading = false;
      },
    );
  }

  getCustomerData(custid) {
    this.custservice.getCustomerMasterList(custid, true).subscribe(
      (data) => {
        let custArr: Array<any> = []; // List of customer

        if (data['isError'] === false && data['code'] === 200) {
          custArr = data['payload'];
          this.custRegiReqForm.get('CustomerName').setValue(custArr.map(t => t.customerName)[0]);
          this.custRegiReqForm.get('Email').setValue(custArr.map(t => t.email)[0]);
          this.custRegiReqForm.get('Mobile').setValue(custArr.map(t => t.contactNo)[0]);
          this.custRegiReqForm.get('PANNo').setValue(custArr.map(t => t.panNo)[0]);
          this.custRegiReqForm.get('GSTNo').setValue(custArr.map(t => t.gstNo)[0]);
          this.panLink = custArr.map(t => t.panCardPath)[0];

        } else {
          // this.customerData = null;
        }
      },
    );
  }

  onSubmit() {
    this.submitted = true;
    if (this.custRegiReqForm.invalid) {
      return;
    }
    this.registerCustomerRequest();
  }

  // onReset() {
  //   this.submitted = false;
  //   this.custRegiReqForm.reset();
  // }

  onList(): void {
    this._router.navigate(['customerList']);
  }

  handleFileInputPan(files: FileList) {

    if (this.validation.validateFile(files[0].name, this.fileExtensions)) {
      this.fileToUploadPAN = files.item(0);
    } else {
      this.commonfunction.showToast('warning', 'Format not Supported', 'Selected file format is not supported !');
      this.panDoc.nativeElement.value = null;
    }
  }

  handleFileInputGst(files: FileList) {
    if (this.validation.validateFile(files[0].name, this.fileExtensions)) {
      this.fileToUploadGST = files.item(0);
    } else {
      this.commonfunction.showToast('warning', 'Format not Supported', 'Selected file format is not supported !');
      this.gstDoc.nativeElement.value = null;
    }
  }
}
