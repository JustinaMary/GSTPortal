import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { HomeServices } from '../../services/home.service';

@Component({
  selector: 'ngx-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})

export class DashboardComponent implements OnInit {
  titleLable = '';
  totalCount: 0;
  pendingCount: 0;
  inProgressCount: 0;
  closedCount: 0;
  pendingPercent: number;
  inProgressPercent: number;
  closedPercent: number;
  constructor(private _auth: AuthenticationService, private homeService: HomeServices) {
    this.titleLable = 'Uploaded Document';
    if (this._auth.getCustId() > 0) {
      this.titleLable = 'Downloaded Document';
    }
  }


  ngOnInit() {

    let type = 0;
    if (this._auth.getAirlineId() > 0) {
      type = 1;
    } else if (this._auth.getCustId() > 0) {
      type = 2;
    }

    this.homeService.getDashboardTicketCount(this._auth.getUserId(), type).subscribe(
      (data) => {
        if (data['message'] === 'Success') {
          const ticketData = data['payload'];
          this.totalCount = ticketData['totalCount'];
          this.pendingCount = ticketData['pendingCount'];
          this.inProgressCount = ticketData['inProgressCount'];
          this.closedCount = ticketData['closedCount'];

          this.pendingPercent = Math.round((this.pendingCount / this.totalCount) * 100);
          this.inProgressPercent = Math.round((this.inProgressCount / this.totalCount) * 100);
          this.closedPercent = Math.round((this.closedCount / this.totalCount) * 100);

        }
      });
  }
}
