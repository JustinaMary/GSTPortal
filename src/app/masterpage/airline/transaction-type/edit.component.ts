import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ngx-edit-transtype-airline',
  templateUrl: './edit.component.html',
})
export class TransTypeEditComponent implements OnInit {
  TypeId = 0;
  title = 'Transaction Type Edit';

  constructor() { }

  ngOnInit(): void {
  }

}
