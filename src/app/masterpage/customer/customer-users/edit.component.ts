import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ngx-edit-user-customer',
  templateUrl: './edit.component.html',
})
export class CUserEditComponent implements OnInit {
  CustUserId = 0;
  title = 'Customer User Edit';

  constructor() { }

  ngOnInit(): void {
  }

}
