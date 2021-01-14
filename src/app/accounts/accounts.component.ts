import { Component } from '@angular/core';
/*import { MENU_ITEMS } from './accounts-menu';*/
@Component({
  selector: 'ngx-accounts',
  styleUrls: ['accounts.component.scss'],
  template: `
    <ngx-zero-column-layout>
      <router-outlet></router-outlet>
    </ngx-zero-column-layout>
  `,
})
export class AccountsComponent {
  /*menu = MENU_ITEMS;*/
}
