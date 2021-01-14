import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ngx-edit-airline',
  templateUrl: './edit.component.html',
})
export class EditComponent implements OnInit {
  AirlineId = 0;
  title = 'Airline Master Edit';

  constructor() { }

  ngOnInit(): void {
  }

}
