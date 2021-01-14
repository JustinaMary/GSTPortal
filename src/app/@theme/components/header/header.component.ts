import { Component, OnDestroy, OnInit } from '@angular/core';
import { NbMediaBreakpointsService, NbSidebarService, NbThemeService } from '@nebular/theme';

import { UserData } from '../../../@core/data/users';
import { LayoutService } from '../../../@core/utils';
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CommonService } from '../../../services/common.service';
import { AuthenticationService } from '../../../services/authentication.service';
import { Router } from '@angular/router';
import { PreviousRouteService } from '../../../services/back.route.service';

@Component({
  selector: 'ngx-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {

  private destroy$: Subject<void> = new Subject<void>();
  userPictureOnly: boolean = false;
  user: any;
  NofCnt: string;
  isLoginUser = false;

  themes = [
    {
      value: 'default',
      name: 'Light',
    },
    {
      value: 'dark',
      name: 'Dark',
    },
    {
      value: 'cosmic',
      name: 'Cosmic',
    },
    {
      value: 'corporate',
      name: 'Corporate',
    },
  ];

  currentTheme = 'default';

  userMenu = [
    // { title: 'Profile', link: '', icon: '' },
    { title: 'Manage Password', link: 'managepw', index: 2 },
    { title: 'Log out', link: 'logout', index: 3 },
    // { title: 'akveo', target: '_blank', url: 'http://akveo.com' },
    // { title: 'Exit', key: 'exit' },
  ];

  constructor(private sidebarService: NbSidebarService,
    // private menuService: NbMenuService,
    private themeService: NbThemeService,
    private userService: UserData,
    private layoutService: LayoutService,
    private breakpointService: NbMediaBreakpointsService,
    private _auth: AuthenticationService,
    private _common: CommonService,
    private _router: Router,
    private previousRouteService: PreviousRouteService,
  ) {
  }

  ngOnInit() {
    if (this._auth.getCustId() === 0 && this._auth.getAirlineId() === 0) {
      this.userMenu.push({ title: 'Reset Password Internal', link: 'resetadminpw', index: 1 });
    } else {
      this.userMenu.push({ title: 'My Profile', link: 'myprofile', index: 1 });
    }

    this.userMenu.sort((a, b) => (a.index > b.index) ? 1 : ((b.index > a.index) ? -1 : 0));

    if (this._auth.loggedIn) {
      this.NotifyCnt(); // Notification count
      this.isLoginUser = true;
    } else {
      document.getElementById('notiBellIcon').style.display = 'none';
      document.getElementsByClassName('menu-sidebar')[0].remove();
    }

    this.currentTheme = this.themeService.currentTheme;

    const userInfo = { name: this._auth.getUserName(), picture: this._auth.getUserProfilePic() };

    this.userService.getUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe((users: any) => this.user = userInfo);

    const { xl } = this.breakpointService.getBreakpointsMap();
    this.themeService.onMediaQueryChange()
      .pipe(
        map(([, currentBreakpoint]) => currentBreakpoint.width < xl),
        takeUntil(this.destroy$),
      )
      .subscribe((isLessThanXl: boolean) => this.userPictureOnly = isLessThanXl);

    this.themeService.onThemeChange()
      .pipe(
        map(({ name }) => name),
        takeUntil(this.destroy$),
      )
      .subscribe(themeName => this.currentTheme = themeName);

  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  changeTheme(themeName: string) {
    this.themeService.changeTheme(themeName);
  }

  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, 'menu-sidebar');
    this.layoutService.changeLayoutSize();

    return false;
  }

  gotoPreviousPage() {
    const prvPage = this.previousRouteService.getPreviousUrl();
    this._router.navigateByUrl(prvPage);
  }

  navigateHome(): void {
    // this._router.navigate(['dashboard']);
  }

  // Tushar : Start
  showNotification(): void {
    this._router.navigate(['notifications']);
  }
  gotoFAQ(): void {
    this._router.navigate(['faq']);
  }
  gotoUserManual(): void {
    this._router.navigate(['usermanual']);
  }
  NotifyCnt() {
    const toUser = this._auth.getUserId();
    this._common.getCntNotification(toUser, 1).subscribe(
      (data) => {
        if (data['isError'] === false && data['code'] === 200) {
          this.NofCnt = (data['payload'] > 9 ? '9+' : String(data['payload']));
          this.NofCnt = (this.NofCnt === '0' ? '' : this.NofCnt);
        } else {
          this.NofCnt = '';
        }
      },
    );
  }
  // Tushar : End
}
