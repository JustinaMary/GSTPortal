import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Login, ResetPasswordVm, ManagePasswordVm, ResetPasswordInternalVm, RolesVm,
   RefreshTokenRequest, RoleModuleActionInsUpdModel,
   UserMenuSession, UserMenuActionSession } from '../models/accounts-model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AccountsService {

  constructor(private httpClient: HttpClient) { }

  login(login: Login): Observable<Login> {
    return this.httpClient.post<Login>(environment.ApiURL + 'Account/Login', login)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  getTokenFromRefreshToken(obj: RefreshTokenRequest): Observable<any> {
    return this.httpClient.post<string>(environment.ApiURL + 'Account/GetFromRefreshToken', obj);
  }


  getGetUserMenu(userId: string): Observable<UserMenuSession[]> {
    return this.httpClient.get<UserMenuSession[]>(environment.ApiURL
      + 'Menus/GetUserMenuSession?UserId=' + userId)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  getGetUserActions(userId: string): Observable<UserMenuActionSession[]> {
    return this.httpClient.get<UserMenuActionSession[]>(environment.ApiURL
      + 'Menus/GetUserMenuActionSession?UserId=' + userId)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  forgotPassword(email: string) {
    return this.httpClient.post<string>(environment.ApiURL +
      'Account/ForgotPassword?Email=' + email, '')
      .pipe(
        catchError(this.errorHandler),
      );
  }

  resetPassword(resetPw: ResetPasswordVm): Observable<ResetPasswordVm> {
    return this.httpClient.post<ResetPasswordVm>(environment.ApiURL +
      'Account/ResetPassword', resetPw)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  resetPasswordInternal(resetPwInt: ResetPasswordInternalVm): Observable<ResetPasswordInternalVm> {
    // debugger;
    return this.httpClient.post<ResetPasswordInternalVm>(environment.ApiURL +
      'Account/ResetPasswordInternally', resetPwInt)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  managePassword(managePw: ManagePasswordVm): Observable<ManagePasswordVm> {
    return this.httpClient.post<ManagePasswordVm>(environment.ApiURL +
      'Account/ManagePassword', managePw)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  getRolesList(role: string, airlineid: number, custid: number): Observable<RolesVm[]> {
    return this.httpClient.get<RolesVm[]>(environment.ApiURL
      + 'Account/GetRoles?Role=' + role
      + '&AirlineId=' + airlineid
      + '&CustId=' + custid)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  getActionMenuData(menuid: number): Observable<RolesVm[]> {
    return this.httpClient.get<RolesVm[]>(environment.ApiURL
      + 'Menus/GetModuleAction?SysId=' + menuid)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  RoleModuleActionPost(objRequestModel: RoleModuleActionInsUpdModel): Observable<number> {
    return this.httpClient.post<number>(environment.ApiURL +
      'Menus/InsUpdRoleModuleAction', objRequestModel)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  deleteUserSession(userId: string, type: number) {
    return this.httpClient.post<string>(environment.ApiURL +
      'Account/DeleteUserSession?UserId=' + userId + '&type=' + type, '')
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
