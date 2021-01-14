import { Component } from '@angular/core';
import { NbMenuItem } from '@nebular/theme';
import { AccountsService } from '../services/accounts.service';
import { AuthenticationService } from '../services/authentication.service';
import { CustomerService } from '../services/customer.service';

@Component({
  selector: 'ngx-masterpage',
  template: `
    <ngx-one-column-layout>
      <nb-menu [items]="menu"></nb-menu>
      <router-outlet></router-outlet>
    </ngx-one-column-layout>
  `,
})


export class MasterPageComponent {
  menu: NbMenuItem[] = [];

  constructor(
    private accservice: AccountsService,
    private custservice: CustomerService,
    private _auth: AuthenticationService) {
    const gradArray = [];
    if (this._auth.loggedIn) {
      if (this._auth.getCustId() > 0) {
        this.custservice.getCustomerRequest(0).subscribe(
          (data2) => {
            if (data2['isError'] === false && data2['code'] === 200
              && data2['payload'].length === 1 && data2['payload'][0].status === 2
              && data2['payload'][0].isAutoRegistered === true) {
              let id: number = 0;
              let idstr: string = '';
              id = data2['payload'][0].reqId;
              const obj = {
                reqId: id,
              };
              idstr = this._auth.encryptData(obj);

              gradArray.push({
                title: 'Profile',
                icon: 'layout-outline',
                link: '/profile/' + idstr,
              });
              this.menu = gradArray;
            } else {
              this.accservice.getGetUserMenu(this._auth.getUserId()).subscribe(
                (data) => {


                  if (data['message'] === 'Success') {
                    const catArr = data['payload'].map(item => item.categoryName)
                      .filter((value, index, self) => self.indexOf(value) === index);

                    catArr.forEach(function (item) {
                      const childArr = [];

                      data['payload'].filter(x => x.categoryName === item).forEach(function (item2) {
                        childArr.push({
                          title: item2.menuName,
                          link: item2.menuURL,
                          icon: item2.icon,
                        });
                      });
                      let icon1 = '';
                      if (childArr.length === 1) {
                        icon1 = childArr[0].icon;
                        if (item === 'Document') {
                          icon1 = 'layers-outline';
                        }
                        gradArray.push({
                          title: item,
                          icon: icon1,
                          link: childArr[0].link,
                        });
                      } else {
                        icon1 = 'list-outline';
                        if (item === 'Document') {
                          icon1 = 'layers-outline';
                        }
                        gradArray.push({
                          title: item,
                          icon: icon1,
                          children: childArr,
                        });
                      }
                    });
                    this.menu = gradArray;
                  }
                });
            }
          },
        );
      } else {
        this.accservice.getGetUserMenu(this._auth.getUserId()).subscribe(
          (data) => {

            if (data['message'] === 'Success') {
              // data['payload'].forEach(function (item) {
              //   gradArray.push({
              //     title: item.menuName,
              //     icon: item.icon,
              //     link: item.menuURL,
              //   });
              // });
              const catArr = data['payload'].map(item => item.categoryName)
                .filter((value, index, self) => self.indexOf(value) === index);

              catArr.forEach(function (item) {
                const childArr = [];

                data['payload'].filter(x => x.categoryName === item).forEach(function (item3) {
                  childArr.push({
                    title: item3.menuName,
                    link: item3.menuURL,
                    icon: item3.icon,
                  });
                });
                let icon2 = '';
                if (childArr.length === 1) {
                  icon2 = childArr[0].icon;
                  if (item === 'Document') {
                    icon2 = 'layers-outline';
                  }
                  gradArray.push({
                    title: item,
                    icon: icon2,
                    link: childArr[0].link,
                  });
                } else {
                  icon2 = 'list-outline';
                  if (item === 'Document') {
                    icon2 = 'layers-outline';
                  }
                  gradArray.push({
                    title: item,
                    icon: icon2,
                    children: childArr,
                  });
                }
              });
              this.menu = gradArray;

            }
          });

      }

    }




  }
}
