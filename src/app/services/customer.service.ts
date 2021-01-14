import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';
import {
  Customer, CustomerStateMaster, CustomerUsers,
  CustomerUsersRM, CustomerStateUserLinkRM, CustomerMaster, RaiseRequestVM, CustStateUsers,
  RaiseRequestResponse, RaiseRequestPost, VerifyRequest, B2CGstRequestList, B2CGstRequestRM,
} from '../models/customer-model';
import { environment } from '../../environments/environment';
import { AuthenticationService } from '../../app/services/authentication.service';


@Injectable({
  providedIn: 'root',
})
export class CustomerService {

  constructor(private httpClient: HttpClient,
    private _auth: AuthenticationService) { }

  // Customer Masters : Start
  getCustomerRequest(reqId): Observable<Customer[]> {
    const UserId = this._auth.getUserId();
    const aId = this._auth.getAirlineId();
    const cId = this._auth.getCustId();
    // console.log(this._auth.getAccToken());



    return this.httpClient
      .get<Customer[]>(environment.ApiURL + 'Customer/GetCustRegisterRequest?ReqId='
        + reqId + '&LUserId=' + UserId + '&aId=' + aId + '&cId=' + cId)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  customerRequestPost(Customervm: Customer): Observable<Customer> {
    return this.httpClient.post<Customer>(environment.ApiURL +
      'Customer/InsUpdCustRegisterRequest', Customervm)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  verifyCustomer(objVerifyReq: VerifyRequest): Observable<Customer[]> {
    return this.httpClient
      .post<Customer[]>(environment.ApiURL + 'Customer/VerifyCustomer', objVerifyReq)
      .pipe(
        catchError(this.errorHandler),
      );
  }


  customerDocUpload(file: File, fileName: string): Observable<Object> {
    const formData: FormData = new FormData();
    formData.append('file', file);

    return this.httpClient.post(environment.ApiURL +
      'Customer/CustomerDocumentUpload?fileName=' + fileName, formData).pipe(
        catchError(this.errorHandler),
      );
  }

  custRegisterRequestDel(reqId: number): Observable<string> {
    return this.httpClient.post<string>(environment.ApiURL +
      'Customer/CustRegisterRequestDelete?ReqId=' + reqId, '')
      .pipe(
        catchError(this.errorHandler),
      );
  }

  // End

  // customer State Master : Start
  getCustomerStateMasterList(custStId, custId): Observable<CustomerStateMaster[]> {
    return this.httpClient
      .get<CustomerStateMaster[]>(environment.ApiURL
        + 'Customer/GetCustomerStateMasterList?CustStId=' + custStId
        + '&CustId=' + custId)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  customerStateMasterPost(customerstatevm: CustomerStateMaster): Observable<CustomerStateMaster> {
    return this.httpClient.post<CustomerStateMaster>(environment.ApiURL +
      'Customer/InsUpdCustomerStateMaster', customerstatevm)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  customerStateMasterDel(custStId: number): Observable<string> {
    return this.httpClient.post<string>(environment.ApiURL +
      'Customer/CustomerStateMasterDelete?CustStId=' + custStId, '')
      .pipe(
        catchError(this.errorHandler),
      );
  }
  // End

  // Customer Users : Start
  getCustomerUserMasterList(custUserId: number, custId: number, userid = ''): Observable<CustomerUsers[]> {
    return this.httpClient
      .get<CustomerUsers[]>(environment.ApiURL
        + 'Customer/GetCustomerUsersList?CustUserId=' + custUserId
        + '&CustId=' + custId
      + '&UserId=' + userid)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  customerUsersPost(customeruservm: CustomerUsersRM,
    email: string,
    userName: string,
    password: string,
    role: string): Observable<CustomerUsersRM> {
    return this.httpClient.post<CustomerUsersRM>(environment.ApiURL +
      'Customer/InsUpdCustomerUsers?Email=' + email
      + '&UserName=' + userName
      + '&Password=' + password
      + '&Role=' + role, customeruservm)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  customerUsersDel(custUserId: number): Observable<string> {
    return this.httpClient.post<string>(environment.ApiURL +
      'Customer/CustomerUsersDelete?CustUserId=' + custUserId, '')
      .pipe(
        catchError(this.errorHandler),
      );
  }

  // End

  // Customer State Users Link : Start
  getCustomerStateUserLink(custUserId: number, custId: number): Observable<CustomerStateUserLinkRM[]> {
    return this.httpClient
      .get<CustomerStateUserLinkRM[]>(environment.ApiURL
        + 'Customer/GetCustomerStateUserLink?CustUserId=' + custUserId
        + '&CustId=' + custId)
      .pipe(
        catchError(this.errorHandler),
      );
  }
  // End


  // CustomerMaster data start
  getCustomerMasterList(custId, isAdminData): Observable<CustomerMaster[]> {
    return this.httpClient
      .get<CustomerMaster[]>(environment.ApiURL
        + 'Customer/GetCustomerMasterList?CustId=' + custId + '&IsAdminData=' + isAdminData)
      .pipe(
        catchError(this.errorHandler),
      );
  }
  // End

  getTicketCheckValidator(Str: string, IsTkt: boolean): Observable<string> {
    const CustId = this._auth.getCustId();
    const UserId = this._auth.getUserId();
    // debugger;
    return this.httpClient
      .get<string>(environment.ApiURL + 'Customer/ValidationForRegisterRequest?Str=' + Str + '&IsTkt=' + IsTkt
        + '&CustId=' + CustId + '&LUserId=' + UserId)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  // getPanGstCheckValidator(PanNo: string, GstNo: string): Observable<string> {
  //   return this.httpClient
  //     .get<string>(environment.ApiURL + 'Customer/ValidationForPanGstCheck?PanNo=' + PanNo +
  //       '&GstNo=' + GstNo)
  //     .pipe(
  //       catchError(this.errorHandler),
  //     );
  // }

  // Tushar Start
  RaiseReqPost(models: RaiseRequestPost): Observable<boolean> {
    return this.httpClient.post<boolean>(environment.ApiURL +
      'Transaction/InsUpdRaiseRequest', models)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  getRaiseRequestList(rrId: number): Observable<RaiseRequestResponse[]> {
    return this.httpClient
      .get<RaiseRequestResponse[]>(environment.ApiURL
        + 'Transaction/GetRaiseReqLists?RrId=' + rrId)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  getRaiseRequestPageList(Userid: string): Observable<RaiseRequestVM[]> {
    return this.httpClient
      .get<RaiseRequestVM[]>(environment.ApiURL
        + 'Transaction/GetRaiseReqPageLists?UserId=' + Userid)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  getCustStateUserList(userId: string, custstid: number): Observable<CustStateUsers[]> {
    return this.httpClient
      .get<CustStateUsers[]>(environment.ApiURL
        + 'Customer/GetCustomerStateUsersList?UserId=' + userId
      + '&CustStId=' + custstid)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  // not used anywhere Jinal
  // getB2cReqPageList(Userid: string): Observable<B2CGstRequestList[]> {
  //   return this.httpClient
  //     .get<B2CGstRequestList[]>(environment.ApiURL
  //       + 'B2CGstInfo/GetB2CGstReqPageLists?UserId=' + Userid)
  //     .pipe(
  //       catchError(this.errorHandler),
  //     );
  // }

  getB2cReqPerPageList(b2CGstRequestRM: B2CGstRequestRM): Observable<B2CGstRequestList[]> {
    return this.httpClient
      .post<B2CGstRequestList[]>(environment.ApiURL
        + 'B2CGstInfo/GetB2CGstReqPerPageLists', b2CGstRequestRM )
      .pipe(
        catchError(this.errorHandler),
      );
  }

  raiseBulkRequest(bulkRequest: FormData): Observable<Object> {
    return this.httpClient.post(environment.ApiURL +
      'Transaction/RaiseBulkQuery', bulkRequest).pipe(
        catchError(this.errorHandler),
      );
  }

  // End

  errorHandler(error) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Get client-side error
      errorMessage = error.error.message;
    } else {
      // Get server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    alert(errorMessage);
    return throwError(errorMessage);
  }

}
