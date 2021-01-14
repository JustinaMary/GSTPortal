import { Router, ActivatedRoute } from '@angular/router';
import { CustomerService } from '../../../services/customer.service';
import { CommonService } from '../../../services/common.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit, SecurityContext, ViewChild, ElementRef } from '@angular/core'; // , Input
import { DomSanitizer } from '@angular/platform-browser';
import { Validation, PANFormatValidator, GSTFormatValidator } from '../../../common/validation';
import { Customer } from '../../../models/customer-model';
import { UserLog } from '../../../models/common-model';
import { AuthenticationService } from '../../../services/authentication.service';
import { CommonFunction } from '../../../common/common-functions';
import { NbDateService } from '@nebular/theme';
import * as moment from 'moment';

@Component({
  selector: 'ngx-profile-custregireq',
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  title = '';
  sub: any;
  panLink = '';
  gstLink = '';
  statusText = '';
  ReqId = 0;
  // enumStatusArr: Array<any> = []; // List of airlines
  IsAirlineUserLogin = false;
  requestDetail = null;
  accessArr: Array<any> = []; // List of menuaccess

  custRegiReqForm: FormGroup;
  submitted = false;
  fileToUploadPAN: File = null;
  fileToUploadGST: File = null;
  isDisabled = false;
  custid = 0;
  max: Date;
  fileExtensions = ['pdf', 'png', 'jpg'];
  // to reset the file
  @ViewChild('panDoc') panDoc: ElementRef;
  @ViewChild('gstDoc') gstDoc: ElementRef;
  airlineCodePrefix = '';


  constructor(private formBuilder: FormBuilder,
    private route: ActivatedRoute, private _router: Router,
    private custservice: CustomerService,
    private commservice: CommonService,
    private _auth: AuthenticationService,
    private commonfunction: CommonFunction,
    private validation: Validation,
    private sanitizer: DomSanitizer,
    protected dateService: NbDateService<Date>) {
    this.max = this.dateService.today();
  }
  ngOnInit() {
    this.custRegiReqForm = this.formBuilder.group({
      CustomerName: ['', [Validators.required]],
      Email: ['', [Validators.required]],
      Mobile: ['', [Validators.required]],
      PANNo: ['', [Validators.required, PANFormatValidator]],
      GSTNo: ['', [Validators.required, GSTFormatValidator]],
      PNRNo: [''], // , [Validators.required]
      TicketNo: ['', [Validators.required]],
      DateofIssue: ['', [Validators.required]],
      Notes: [''],
      PanDoc: [''],
      GstDoc: [''],
    }, {
        validator: [
          // this.validation.ticketAndGstCheckValidator('TicketNo', true),
          // this.validation.ticketAndGstCheckValidator('GSTNo', false),
        ],
      });

    this.sub = this.route.params.subscribe(params => {
      const id = this._auth.decryptData(params['reqId']) || 0;
      this.ReqId = id['reqId'] || 0;

      if (this._auth.getCustId() > 0) {
        this.custservice.getCustomerRequest(0).subscribe(
          (data2) => {

            if (data2['isError'] === false && data2['code'] === 200
              && data2['payload'].length === 1 && data2['payload'][0].status === 2
              && data2['payload'][0].isAutoRegistered === true && this.ReqId !== 0) {
              this.getCustReqData(this.ReqId);
            } else {
              if (this.ReqId === 0) {
                const message = '401 Unauthorized page: Customer Register Request Profile';
                this.commonfunction.ErrorLogHdlFunc(message, this._auth.getUserId());
                this._router.navigate(['unauthorized']);
              } else {
                this._router.navigate(['/dashboard']);
              }

            }

          },
        );
      }

    });


  }

  get f() { return this.custRegiReqForm.controls; }

  onSubmit() {
    this.submitted = true;
    if (this.custRegiReqForm.invalid) {
      return;
    }
    this.registerCustomerRequest();
  }

  registerCustomerRequest(): void {
    // debugger;
    this.isDisabled = true;
    const objCustomer: Customer = new Customer();
    // objCustomer.CreatedBy = this._auth.getUserId();
    objCustomer.ReqId = this.ReqId;
    objCustomer.TicketNo = this.sanitizer.sanitize(SecurityContext.HTML,
      this.airlineCodePrefix + this.custRegiReqForm.controls['TicketNo'].value);
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
          let gstFileName = Math.floor(1000 + Math.random() * 9000) + '_' + reqId + '_11.jpg';
          // debugger;
          if (this.fileToUploadPAN === null) {
            panFileName = Math.floor(1000 + Math.random() * 9000) + '_'
              + reqId + '_10_' + this.panLink.split('/').pop();
          }

          if (this.fileToUploadGST === null) {
            gstFileName = Math.floor(1000 + Math.random() * 9000) + '_'
              + reqId + '_11_' + this.gstLink.split('/').pop();
          }

          this.custservice.customerDocUpload(this.fileToUploadPAN, panFileName).subscribe(data2 => {
            // do something, if upload success // alert('fileresponce  come');
          }, error => { alert(error); });

          this.custservice.customerDocUpload(this.fileToUploadGST, gstFileName).subscribe(data3 => {
            // do something, if upload success // alert('fileresponce  come');
          }, error => { alert(error); });

          const objULog: UserLog = new UserLog();
          objULog.Action = 'Customer Register Request Profile';
          objULog.UserId = this._auth.getUserId();
          objULog.PageName = 'Customer Register Request Profile';
          objULog.Notes = 'Customer Register Request Profile';

          this.commservice.insertUserLog(objULog).subscribe(data3 => {
            // do something, success
          }, error => { alert(error); });
          this.isDisabled = false;

        } else {
          this.commonfunction.showToast('danger', 'Failed', 'Not saved');
          this.isDisabled = false;
        }
      },
    );
  }

  // Get cust detail Data
  getCustReqData(reqid = 0) {
    this.custservice.getCustomerRequest(reqid).subscribe(
      (data) => {
        if (data['isError'] === false && data['code'] === 200) {
          this.requestDetail = data['payload'][0];
        } else {
          // custArr = [];
        }
        if (this._auth.getAirlineId() > 0 || this._auth.getRoleName() === 'Airline Admin') {
          this.IsAirlineUserLogin = true;
        }
        if (reqid > 0) {
          // this.custRegiReqForm.get('Status').setValue(this.requestDetail.status);
          this.custRegiReqForm.get('Notes').setValue(this.requestDetail.notes);
          this.panLink = this.requestDetail.document.filter(x => x.docType === 10)[0].docPath;
          this.gstLink = this.requestDetail.document.filter(x => x.docType === 11)[0].docPath;
          if (this.requestDetail.verifiedOn === '0001-01-01T00:00:00') {
            this.requestDetail.verifiedOn = '';
          }
          // this.statusText = this.enumStatusArr.filter(x => x.enumId === this.requestDetail.status)[0].description;
          this.custRegiReqForm.get('CustomerName').setValue(this.requestDetail.customerName);
          this.custRegiReqForm.get('Email').setValue(this.requestDetail.email);
          this.custRegiReqForm.get('Mobile').setValue(this.requestDetail.mobile);
          this.custRegiReqForm.get('PANNo').setValue(this.requestDetail.panNo);
          this.custRegiReqForm.get('GSTNo').setValue(this.requestDetail.gstNo);
          this.custRegiReqForm.get('PNRNo').setValue(this.requestDetail.pnr);
          if (this.requestDetail.ticketNo !== null && this.requestDetail.ticketNo !== '') {
            this.custRegiReqForm.get('TicketNo').setValue(
              this.requestDetail.ticketNo.substring(3, (this.requestDetail.ticketNo.length)));
          }
          this.airlineCodePrefix = this.requestDetail.airlineCode;
          if (this.requestDetail.dateofIssue !== null) {
            this.custRegiReqForm.get('DateofIssue').setValue(moment(new Date(this.requestDetail.dateofIssue)));
          }
        }
      },
    );
  }


  // Get cust detail Data
  // getEnumStatusList() {
  //   this.commservice.getEnumData('CRS').subscribe(
  //     (data) => {

  //       if (data['isError'] === false && data['code'] === 200) {
  //         this.enumStatusArr = data['payload'];
  //       } else {
  //         this.enumStatusArr = [];
  //       }

  //       // console.log(this.enumStatusArr);
  //     },
  //   );
  // }
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

