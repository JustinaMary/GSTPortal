// import { NbMenuService } from '@nebular/theme';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'ngx-unauthorized',
  styleUrls: ['./unauthorized.component.scss'],
  templateUrl: './unauthorized.component.html',
})
export class UnauthorizedComponent {

  constructor(private _router: Router) { // private menuService: NbMenuService
  }

  goToHome() {

    this._router.navigate(['dashboard']);
    // this.menuService.navigateHome();
  }
}
