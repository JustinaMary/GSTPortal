import { Component } from '@angular/core';
import { PreviousRouteService } from '../../../services/back.route.service';
import { Router } from '@angular/router';

@Component({
  selector: 'ngx-one-column-layout',
  styleUrls: ['./one-column.layout.scss'],
  template: `
    <nb-layout windowMode>
      <nb-layout-header fixed>
        <ngx-header></ngx-header>
      </nb-layout-header>

      <nb-sidebar class="menu-sidebar" tag="menu-sidebar" responsive>
        <ng-content select="nb-menu"></ng-content>
      </nb-sidebar>

      <nb-layout-column class="col-md-12 py-3 mx-3">
      <div class="col-md-12 py-3">
      <button outline status="primary" class="back-btn" (click)="gotoPreviousPage()">
      <nb-icon class="fa fa-arrow-left" pack="font-awesome"></nb-icon> Back
      </button>
      </div>
      <div class="col-md-12">
      <ng-content select="router-outlet"></ng-content>
      </div>
      </nb-layout-column>

      <nb-layout-footer fixed>
        <ngx-footer></ngx-footer>
      </nb-layout-footer>
    </nb-layout>
  `,
})
export class OneColumnLayoutComponent {
  constructor( private previousRouteService: PreviousRouteService, private _router: Router) { }

  gotoPreviousPage() {
    const prvPage = this.previousRouteService.getPreviousUrl();
    this._router.navigateByUrl(prvPage);
  }

}
