import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ngx-edit-state-airline',
  templateUrl: './edit.component.html',
})
export class StateEditComponent implements OnInit {
  AirStId = 0;
  title = 'Airline State Edit';

  constructor() { }

  ngOnInit(): void {
  }

}
