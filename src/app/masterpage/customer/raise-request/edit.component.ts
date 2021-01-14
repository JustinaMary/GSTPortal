import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ngx-edit-raise-request',
  templateUrl: './edit.component.html',
})
export class RaiseRequestEditComponent implements OnInit {
  RrId = 0;
  title = 'Raise Request Edit';

  constructor() { }

  ngOnInit(): void {
  }

}
