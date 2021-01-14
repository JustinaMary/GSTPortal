import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'ngx-myprofile',
  templateUrl: './myprofile.component.html',
})
export class MyProfileComponent implements OnInit {
  title = 'My Profile';
  custid = 0;
  airid = 0;

  constructor(private _auth: AuthenticationService) { }

  ngOnInit(): void {
    this.airid = this._auth.getAirlineId();
    this.custid = this._auth.getCustId();
  }

}
