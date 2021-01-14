
import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import {
    // CookieService,
  } from 'ngx-cookie-service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(private _router: Router,
        // private cookieService: CookieService
        ) { }
    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        // if (this.cookieService.get('logdata') !== '') {
        //     return true;
        // }
        if (localStorage.getItem('logdata') !== null) {
            return true;
        }
        this._router.navigate(['']);
        // this._router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return false;
    }
}
