import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';
import {
  Airline,
  AirlineStateMaster,
  StateGstMaster,
  AirlineUsers,
  AirlineUsersRM,
  AirlineStateUserLinkRM,
  TransactionType,
} from '../models/airlines-model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})

export class AirlineService {

  constructor(private httpClient: HttpClient) { }

  // Airline Masters : Start
  getAirlineMasterList(airlineId): Observable<Airline[]> {
    return this.httpClient
      .get<Airline[]>(environment.ApiURL + 'Airline/GetAirlineMasterList?AirlineId=' + airlineId)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  AirlineMasterPost(airlinevm: Airline): Observable<Airline> {
    return this.httpClient.post<Airline>(environment.ApiURL +
      'Airline/InsUpdAirlineMaster', airlinevm)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  AirlineMasterDel(AirlineId: number): Observable<string> {
    return this.httpClient.post<string>(environment.ApiURL +
      'Airline/ArlineMasterDelete?AirlineId=' + AirlineId, '')
      .pipe(
        catchError(this.errorHandler),
      );
  }
  // End

  // Airline State Master : Start
  getAirlineStateMasterList(airStId, airlineId): Observable<AirlineStateMaster[]> {
    return this.httpClient
      .get<AirlineStateMaster[]>(environment.ApiURL
        + 'Airline/GetAirlineStateMasterList?AirStId=' + airStId
        + '&AirlineId=' + airlineId)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  AirlineStateMasterPost(airlinestatevm: AirlineStateMaster): Observable<AirlineStateMaster> {
    return this.httpClient.post<AirlineStateMaster>(environment.ApiURL +
      'Airline/InsUpdAirlineStateMaster', airlinestatevm)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  AirlineStateDel(AirStId: number): Observable<string> {
    return this.httpClient.post<string>(environment.ApiURL +
      'Airline/ArlineStateMasterDelete?AirStId=' + AirStId, '')
      .pipe(
        catchError(this.errorHandler),
      );
  }
  // End

  // Airline State GST : Start
  getStateGSTList(gstId: string): Observable<StateGstMaster[]> {
    return this.httpClient
      .get<StateGstMaster[]>(environment.ApiURL + 'Master/GetStateGstList?GstId=' + gstId)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  // getCitiesList(stId: string): Observable<StateGstMaster[]> {
  //   return this.httpClient
  //     .get<StateGstMaster[]>(environment.ApiURL + 'Master/GetCitiesList?SId=' + stId)
  //     .pipe(
  //       catchError(this.errorHandler),
  //     );
  // }

  // End

  // Airline Users : Start
  getAirlineUserMasterList(airUserId: number, airlineId: number, userid: string): Observable<AirlineUsers[]> {
    return this.httpClient
      .get<AirlineUsers[]>(environment.ApiURL
        + 'Airline/GetAirlineUsersList?AirUserId=' + airUserId
        + '&AirlineId=' + airlineId + '&UserId=' + userid)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  AirlineUsersPost(airlineuservm: AirlineUsersRM,
    email: string,
    userName: string,
    password: string,
    role: string): Observable<AirlineUsersRM> {
    return this.httpClient.post<AirlineUsersRM>(environment.ApiURL +
      'Airline/InsUpdAirlineUsers?Email=' + email
      + '&UserName=' + userName
      + '&Password=' + password
      + '&Role=' + role, airlineuservm)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  AirlineUserDel(AirUserId: number): Observable<string> {
    return this.httpClient.post<string>(environment.ApiURL +
      'Airline/ArlineUsersDelete?AirUserId=' + AirUserId, '')
      .pipe(
        catchError(this.errorHandler),
      );
  }
  // End

  // Airline State Users Link : Start
  getAirlineStateUserLink(airUserId: number, airlineId: number): Observable<AirlineStateUserLinkRM[]> {
    return this.httpClient
      .get<AirlineStateUserLinkRM[]>(environment.ApiURL
        + 'Airline/GetAirlineStateUserLink?AirUserId=' + airUserId
        + '&AirlineId=' + airlineId)
      .pipe(
        catchError(this.errorHandler),
      );
  }
  // End


  // Transaction Type : Start
  transactionTypeList(typeId: number, airlineId: number): Observable<TransactionType[]> {
    return this.httpClient
      .get<TransactionType[]>(environment.ApiURL
        + 'Master/GetTransactionTypeList?TypeId=' + typeId
        + '&AirlineId=' + airlineId)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  transactionTypePost(ttvm: TransactionType): Observable<TransactionType> {
    return this.httpClient.post<TransactionType>(environment.ApiURL +
      'Master/InsUpdTransactionType', ttvm)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  transactionTypeDel(typeId: number): Observable<string> {
    return this.httpClient.post<string>(environment.ApiURL +
      'Master/TransactionTypeDelete?TypeId=' + typeId, '')
      .pipe(
        catchError(this.errorHandler),
      );
  }
 // to get the airline Id from 3 digit code
  getAirlineMasterWithCode(airlineCode): Observable<Airline[]> {
    return this.httpClient
      .get<Airline[]>(environment.ApiURL + 'Airline/GetAirlineMasterList?Digit3Code=' + airlineCode)
      .pipe(
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
