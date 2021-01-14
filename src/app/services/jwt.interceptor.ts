import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { AuthenticationService } from './authentication.service';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { AccountsService } from './accounts.service';
import { switchMap, take, filter } from 'rxjs/operators';
import { RefreshTokenRequest } from '../models/accounts-model';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    private refreshTokenInProgress = false;
    private refreshTokenSubject: Subject<any> = new BehaviorSubject<any>(null);



    constructor(private authService: AuthenticationService, private accservice: AccountsService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // add authorization header with jwt token if available
        // https://stackoverflow.com/questions/57637923/angular-8-intercept-call-to-refresh-token
        if (!this.authService.loggedIn) {
            return next.handle(request);
        }

        if (request.url.indexOf('GetFromRefreshToken') !== -1 ||
        request.url.indexOf('api.ipify.org') !== -1) {
            return next.handle(request);
        }
        const accessExpired = this.authService.isAccessTokenExpired();
        // const refreshExpired = this.authService.isRefreshTokenExpired();

        // if (accessExpired && refreshExpired) {
        //     return next.handle(request);
        // }

        if (accessExpired) {
            if (!this.refreshTokenInProgress) {
                this.refreshTokenInProgress = true;
                this.refreshTokenSubject.next(null);

                const obj: RefreshTokenRequest = new RefreshTokenRequest();
                obj.RefreshToken = this.authService.getRefToken();
                    // this.authService.getIPAddress().subscribe((res: any) => {
                    // obj.IpAddress = res.ip;
                    obj.IpAddress = this.authService.getIp(); // ipadd; '103.197.227.212';
                    return this.accservice.getTokenFromRefreshToken(obj).pipe(
                        switchMap((authResponse) => {
                            this.authService.saveToken(authResponse.payload.accessToken,
                                authResponse.payload.refreshToken, authResponse.payload.expires);
                            this.refreshTokenInProgress = false;
                            this.refreshTokenSubject.next(authResponse.payload.refreshToken);
                            return next.handle(this.injectToken(request));
                        }),
                    );
                // });
            } else {
                return this.refreshTokenSubject.pipe(
                    filter(result => result !== null),
                    take(1),
                    switchMap((res) => {
                        return next.handle(this.injectToken(request));
                    }),
                );
            }
        }

        if (!accessExpired) {
            return next.handle(this.injectToken(request));
        }
    }

    injectToken(request: HttpRequest<any>) {
        return request.clone({
            setHeaders: {
                Authorization: `Bearer ${this.authService.getAccToken()}`,
            },
        });
    }


}
