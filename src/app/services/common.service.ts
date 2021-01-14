import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, delay, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import {
  EnumVm,
  UniqueCheckRM,
  UserLog,
  Notifications,
  RequestMaster,
  ErrorLog,
  EmailConfiguration,
} from '../models/common-model';
import { environment } from '../../environments/environment';



@Injectable({
  providedIn: 'root',
})
export class CommonService {

  // httpOptions = {
  //   headers: new HttpHeaders({
  //     'Content-Type': 'application/json',
  //   }),
  // };

  // httpOptionsWithToken = {

  //   headers: new HttpHeaders({
  //     'Content-Type': 'application/json',
  //     'Authorization': 'Bearer ' + this._auth.getAccToken(),

  //   }),
  // };

  constructor(private httpClient: HttpClient) { }

  getEnumData(type): Observable<EnumVm[]> {
    return this.httpClient
      .get<EnumVm[]>(environment.ApiURL + 'Master/EnumList?Type=' + type)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  // Tushar: Unique check common
  getUniqueCheckData(unique_Check_RM: UniqueCheckRM): Observable<string> {
    return this.httpClient
      .post<string>(environment.ApiURL + 'Common/UniqueCheck', unique_Check_RM)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  getUniqueEmailCheckData(Email: string, userid: string): Observable<string> {
    if (userid === '') {
      userid = '00000000-0000-0000-0000-000000000000';
    }
    return this.httpClient
      .get<string>(environment.ApiURL + 'Account/UniqueEmailCheck?Email=' + Email
        + '&UserId=' + userid)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  getUniqueUserNameCheckData(id: number, userNm: string, Type: string): Observable<string> {
    return this.httpClient
      .get<string>(environment.ApiURL + 'Account/UniqueUserNameCheck?Id=' + id
        + '&UserName=' + userNm
        + '&Type=' + Type)
      .pipe(
        catchError(this.errorHandler),
      );
  }
  // End

  // Tushar: Notifications
  getCntNotification(ToUserId: string, type: number): Observable<number> {
    return this.httpClient
      .get<number>(environment.ApiURL + 'Notification/GetCntNotifications?ToUserId=' + ToUserId
        + '&Type=' + type,
      )
      .pipe(
        catchError(this.errorHandler),
      );
  }

  getNotificationsDataLists(ToUserId: string, startIndex: number, pageSize: number): Observable<Notifications[]> {
    return this.httpClient
      .get<Notifications[]>(environment.ApiURL + 'Notification/GetNotificationsLists?ToUserId=' + ToUserId
        + '&startIndex=' + startIndex
        + '&pageSize=' + pageSize,
        // this.httpOptions
      )
      .pipe(
        map(news => news['payload']),
        delay(1500),
        catchError(this.errorHandler),
      );
  }

  UpdNotificationsData(notifyid: number): Observable<boolean> {
    return this.httpClient
      .post<boolean>(environment.ApiURL + 'Notification/UpdateNotifications?notifyId=' + notifyid, '')
      .pipe(
        catchError(this.errorHandler),
      );
  }
  // End

  // Tushar start: Request Type
  getRequestMasterList(id: number): Observable<RequestMaster[]> {
    return this.httpClient
      .get<RequestMaster[]>(environment.ApiURL
        + 'Master/GetRequestMasterList?Id=' + id)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  RequestMasterPost(requestMaster: RequestMaster): Observable<RequestMaster> {
    return this.httpClient.post<RequestMaster>(environment.ApiURL +
      'Master/InsUpdRequestMaster', requestMaster)
      .pipe(
        catchError(this.errorHandler),
      );
  }
  // End

  insertUserLog(uLog: UserLog): Observable<boolean> {
    return this.httpClient
      .post<boolean>(environment.ApiURL + 'Common/InsertLogs', uLog)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  ErrorLogHandle(errorLog: ErrorLog) {
    return this.httpClient.post<string>(environment.ApiURL +
      'Account/ErrorLogPost', errorLog)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  getMenuMasterList(airlineid: number, custid: number): Observable<RequestMaster[]> {
    return this.httpClient
      .get<RequestMaster[]>(environment.ApiURL
        + 'Menus/GetSystemModule?custId=' + custid + '&airlineId=' + airlineid)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  getDashboardData(userId: string, type: number) {
    return this.httpClient.get<string>(environment.ApiURL +
      'GstInfo/GetDashboardData?UserId=' + userId + '&type=' + type)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  getCustomerEmailDomain(custId: number): Observable<string> {
    return this.httpClient
      .get<string>(environment.ApiURL + 'Customer/GetCustomerAdminEmail?CustId=' + custId)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  getEmailConfiguration(airlineId: number): Observable<EmailConfiguration> {
    return this.httpClient
      .get<EmailConfiguration>(environment.ApiURL + 'EmailConfig/GetEmailConfiguration?AirlineId=' + airlineId)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  postEmailConfiguration(emailconfig: EmailConfiguration) {
    return this.httpClient.post<string>(environment.ApiURL +
      'EmailConfig/EmailConfigInsUpd', emailconfig)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  testEmailConfiguration(toAddress: string, airlineId: number) {
    return this.httpClient.post<string>(environment.ApiURL +
      'EmailConfig/TestEmailSetting?ToAddress=' + toAddress + '&AirlineId=' + airlineId, null)
      .pipe(
        catchError(this.errorHandler),
      );
  }


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
