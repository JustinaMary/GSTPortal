import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ngx-edit-state-customer',
  templateUrl: './edit.component.html',
})
export class CStateEditComponent implements OnInit {
  CustStId = 0;
  title = 'Customer State Edit';

  constructor() { }

  ngOnInit(): void {
  }

}
