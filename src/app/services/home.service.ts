import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Login, Register, B2CGstRequest, RaisedTicketCount } from '../models/home-model';

@Injectable({
  providedIn: 'root',
})

export class HomeServices {

  constructor(private httpClient: HttpClient) { }

  login(login: Login): Observable<Login> {
    return this.httpClient.post<Login>(environment.ApiURL + 'Account/Login', login)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  register(register: Register): Observable<Register> {
    return this.httpClient.post<Register>(environment.ApiURL + 'Customer/InsUpdCustRegisterRequest', register)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  customerDocUpload(customerDoc: FormData): Observable<Object> {
    return this.httpClient.post(environment.ApiURL +
      'Customer/UploadCustomerDocument', customerDoc).pipe(
        catchError(this.errorHandler),
      );
  }

  isEmailVerified(email: string): Observable<string> {
    return this.httpClient
      .get<string>(environment.ApiURL + 'B2CGstInfo/IsEmailVerified?Email=' + email)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  sendOtpEmail(email: string): Observable<string> {
    return this.httpClient
      .post<string>(environment.ApiURL + 'B2CGstInfo/SendOtpEmail?Email=' + email, '')
      .pipe(
        catchError(this.errorHandler),
      );
  }

  verifyOtp(email: string, otp: string): Observable<string> {
    return this.httpClient
      .post<string>(environment.ApiURL + 'B2CGstInfo/VerifyOtp?Email=' + email + '&Otp=' + otp, '')
      .pipe(
        catchError(this.errorHandler),
      );
  }

  b2cRaiseRequest(b2cRequest: B2CGstRequest): Observable<B2CGstRequest> {
    return this.httpClient.post<B2CGstRequest>(environment.ApiURL + 'B2CGstInfo/B2CGstRequestInsUpd', b2cRequest)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  isAirlineCodeExist(ticketNo: string): Observable<string> {
    return this.httpClient
      .get<string>(environment.ApiURL + 'B2CGstInfo/isAirlineExist?TicketNo=' + ticketNo)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  isAirlineTktExistsValidation(ticketNo: string): Observable<string> {
    return this.httpClient
      .get<string>(environment.ApiURL + 'Transaction/isAirlineTktExistsValidation?TicketNo=' + ticketNo)
      .pipe(
        catchError(this.errorHandler),
      );
  }


  getDashboardTicketCount(userId: string, type: number) {
    return this.httpClient.get<RaisedTicketCount>(environment.ApiURL +
      'Transaction/GetDashboardTicketCount?UserId=' + userId + '&type=' + type)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  isContactNoExist(contactNo: string, userid: string): Observable<string> {
    if (userid === '') {
      userid = '00000000-0000-0000-0000-000000000000';
    }
    return this.httpClient
      .get<string>(environment.ApiURL + 'Account/IsContactNoExist?ContactNo=' + contactNo +
        '&UserId=' + userid)
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
