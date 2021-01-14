/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from './@core/utils/analytics.service';
import { SeoService } from './@core/utils/seo.service';
import { AuthenticationService } from '../app/services/authentication.service';
import { NbIconLibraries } from '@nebular/theme';

@Component({
  selector: 'ngx-app',
  template: '<router-outlet></router-outlet>',
})
export class AppComponent implements OnInit {
  title = 'app';
  isLoggedin = false;
  userprofilepic = null;
  username = '';

  constructor(private analytics: AnalyticsService, private seoService: SeoService,
    private _auth: AuthenticationService, private iconLibraries: NbIconLibraries) {

    if (this._auth.loggedIn) {
      this.isLoggedin = true;
      const pp = this._auth.getUserProfilePic();
      if (pp === '')
        this.userprofilepic = './assets/images/client.jpg';
      else
        this.userprofilepic = pp;

      this.username = this._auth.getUserName();
    }
    this.iconLibraries.registerFontPack('font-awesome');
    this.iconLibraries.setDefaultPack('font-awesome'); // <---- set as default
  }

  ngOnInit(): void {
    this.analytics.trackPageViews();
    this.seoService.trackCanonicalChanges();
  }

}
