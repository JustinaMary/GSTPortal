import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ngx-edit-user-airline',
  templateUrl: './edit.component.html',
})
export class UserEditComponent implements OnInit {
  AirUserId = 0;
  title = 'Airline User Edit';

  constructor() { }

  ngOnInit(): void {
  }

}
