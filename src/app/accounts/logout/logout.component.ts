import { Component } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { Router } from '@angular/router';
import { AccountsService } from '../../services/accounts.service';

@Component({
  selector: 'ngx-logout',
  template: ``,
})
export class LogoutComponent {

  constructor(private _auth: AuthenticationService,
    private accservice: AccountsService,
    private _router: Router) {
    let type = 0;
    if (this._auth.getAirlineId() > 0) {
      type = 1;
    } else if (this._auth.getCustId() > 0) {
      type = 2;
    }
    if (this._auth.loggedIn) {
      const userid = this._auth.getUserId();
      setTimeout(() => {
        this.accservice.deleteUserSession(userid, type).subscribe(
          (data) => {
            // if (data['message'] === 'Success') {
            // }
          },
        );
      }, 200);

      this._auth.logout();
      this._router.navigate(['/']);
    } else {
      this._router.navigate(['/']);
    }
  }

}
