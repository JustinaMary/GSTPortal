// import { NbMenuService } from '@nebular/theme';
import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { CommonFunction } from '../common/common-functions';
import { Router } from '@angular/router';

@Component({
    selector: 'ngx-not-found',
    templateUrl: './notfound.component.html',
    styleUrls: ['notfound.component.scss'],
})
export class NotFoundComponent implements OnInit {

    userid = '';
    constructor(private _router: Router,
        private _auth: AuthenticationService,
        private commonfunction: CommonFunction,
    ) { // private menuService: NbMenuService
    }
    ngOnInit() {
        if (this._auth.loggedIn) {
            this.userid = this._auth.getUserId();
        }
        const message = 'Page not found';
        this.commonfunction.ErrorLogHdlFunc(message, this.userid);
    }

    goToHome() {
        if (this._auth.loggedIn) {
            this._router.navigate(['/dashboard']);
        } else {
            this._router.navigate(['']);
        }
    }
}
