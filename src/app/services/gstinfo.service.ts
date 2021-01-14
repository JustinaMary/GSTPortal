import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';
import {
  VerifByAirlines,
  GstInfoRequest,
  GstInformationListResponse,
  GstInfoDownloadRequest,
  GstInformationExcel,
} from '../models/gstinfo-model';
import { environment } from '../../environments/environment';
import { AuthenticationService } from '../../app/services/authentication.service';

@Injectable({
  providedIn: 'root',
})
export class GstInfoService {

  constructor(private httpClient: HttpClient, private _auth: AuthenticationService) { }

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  httpOptionsWithToken = {

    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this._auth.getAccToken(),

    }),
  };

  // gst file upload function

  gstDocUpload(file: File, userid: string): Observable<Object> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    formData.append('UserId', userid);

    return this.httpClient.post(environment.ApiURL +
      'GstInfo/UploadFile', formData).pipe(
      catchError(this.errorHandler),
    );
  }

  getVerfAirList(custid): Observable<VerifByAirlines[]> {
    return this.httpClient
      .get<VerifByAirlines[]>(environment.ApiURL + 'Customer/GetVerifyByAirlinesList?CustId=' + custid)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  getGstSearchResponse(gstInfoRequest: GstInfoRequest): Observable<GstInformationListResponse[]> {
    return this.httpClient.post<GstInformationListResponse[]>(environment.ApiURL +
      'GstInfo/GetGstInfoAllData', gstInfoRequest)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  getGstExcelResponse(gstInfoExcelRequest: GstInfoDownloadRequest): Observable<GstInformationExcel[]> {
    return this.httpClient.post<GstInformationExcel[]>(environment.ApiURL +
      'GstInfo/GetGstInfoExcelData', gstInfoExcelRequest)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  getPdfFile(gstInfoPdfRequest: GstInfoDownloadRequest): Observable<string> {
    return this.httpClient
      .post<string>(environment.ApiURL + 'GstInfo/GstPDFDownload', gstInfoPdfRequest)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  getCustomerGstStates(lUserId): Observable<string[]> {
    return this.httpClient
      .get<string[]>(environment.ApiURL + 'Customer/GetCustomerGstStates?lUserId=' + lUserId)
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
