import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import { RoleModuleActionInsUpd, RoleModuleActionInsUpdModel } from '../../models/accounts-model';

import { CommonFunction } from '../../common/common-functions';
import { AccountsService } from '../../services/accounts.service';
import { UserLog } from '../../models/common-model';
import { CommonService } from '../../services/common.service';



@Component({
  selector: 'ngx-menuaction',
  templateUrl: './menuaction.component.html',
})

export class MenuActionComponent implements OnInit {
  sub: any;
  menuId = 0;
  airid = 0;
  custid = 0;
  roleArr: Array<any> = [];
  actionArr: Array<any> = [];
  modName = '';
  catName = '';
  loading = false;
  @Input() id: number;

  constructor(
    private route: ActivatedRoute,
    private _router: Router,
    private accountsService: AccountsService,
    private _auth: AuthenticationService,
    private commservice: CommonService,
    private commonfunction: CommonFunction,
  ) { }

  ngOnInit() {
    this.airid = this._auth.getAirlineId();
    this.custid = this._auth.getCustId();

    this.sub = this.route.params.subscribe(params => {
      const id = this._auth.decryptData(params['id']) || 0;
      this.menuId = id['id'] || 0;

      const rolename = this._auth.getRoleName();
      if (rolename === 'Airline Admin' || rolename === 'Customer Admin') {
        this.getRoleData();
        this.getActionMenuData();
      } else {
        const message = '401 Unauthorized page: Manage Module';
        this.commonfunction.ErrorLogHdlFunc(message, this._auth.getUserId());
        this._router.navigate(['unauthorized']);
      }
    });

  }

  // Get Roles
  getRoleData() {
    this.accountsService.getRolesList('', this.airid, this.custid).subscribe(
      (data) => {
        if (data['isError'] === false && data['code'] === 200) {
          this.roleArr = data['payload'];
        } else {
          this.roleArr = [];
        }
      },
    );
  }

  getActionMenuData() {
    this.accountsService.getActionMenuData(this.menuId).subscribe(
      (data) => {
        if (data['isError'] === false && data['code'] === 200) {

          this.actionArr = data['payload'];
          this.modName = data['payload'].systemModule.name;
          this.catName = data['payload'].systemModule.category;

        } else {
          this.actionArr = [];
        }
      },
    );
  }

  checkValueMenu(event: any, action) {

    const selectedName = action['action'];
    const roleid = action['roleId'];
    if (event.target.checked) {
      if (selectedName !== 'List') {
        const selfitem = this.actionArr['moduleActionList'].findIndex(
          (t => t.action === selectedName && t.roleId === roleid));
        const item = this.actionArr['moduleActionList'].findIndex(
          (t => t.action === 'List' && t.roleId === roleid));
        if (this.actionArr['moduleActionList'][selfitem].isActive === false) {
          this.actionArr['moduleActionList'][selfitem].isActive = true;
        }
        if (this.actionArr['moduleActionList'][item].isActive === false) {
          this.actionArr['moduleActionList'][item].isActive = true;
          // Sweet alert
          this.commonfunction.showToast('info', 'Access Information', 'List action will also apply');
        }
      } else {
        const item = this.actionArr['moduleActionList'].findIndex(
          (t => t.action === selectedName && t.roleId === roleid));

        if (this.actionArr['moduleActionList'][item].isActive === false) {
          this.actionArr['moduleActionList'][item].isActive = true;
        }
      }
    } else {
      if (selectedName !== 'List') {
        const item = this.actionArr['moduleActionList'].findIndex(
          (t => t.action === selectedName && t.roleId === roleid));
        if (this.actionArr['moduleActionList'][item].isActive === true) {
          this.actionArr['moduleActionList'][item].isActive = false;
        }
      } else {
        let cnt = 0;
        this.actionArr['moduleActionList'].filter((t => t.roleId === roleid)).forEach(x => {
          if (x.isActive === true && x.action === 'List') {
            x.isActive = false;
          }
          if (x.isActive === true && x.action !== 'List') {
            x.isActive = false;
            if (cnt === 0) {
              // Sweet alert
              this.commonfunction.showToast('info', 'Access Information', 'All actions will also removed');
            }
            cnt++;
          }
        });
      }
    }
  }

  onList(): void {
    this._router.navigate(['menuMaster']);
  }

  onSave(roleid, action): void {
    const LUserId = this._auth.getUserId();
    this.loading = true;
    const objMainList: RoleModuleActionInsUpdModel = new RoleModuleActionInsUpdModel();
    const objRoleList: Array<RoleModuleActionInsUpd> = new Array<RoleModuleActionInsUpd>();

    const valueArr = this.actionArr['moduleActionList'].filter(t => t.roleId === roleid && t.isActive === true);
    for (let j = 0; j < valueArr.length; j++) {
      const objList: RoleModuleActionInsUpd = new RoleModuleActionInsUpd();
      objList.RoleId = valueArr[j]['roleId'];
      objList.ModuleId = valueArr[j]['moduleId'];
      objList.ModuleActionId = valueArr[j]['moduleActionId'];
      objRoleList.push(objList);
    }
    objMainList.ModuleActionList = objRoleList;
    objMainList.UserId = LUserId;

    this.accountsService.RoleModuleActionPost(objMainList).subscribe(
      (data) => {
        if (data['isError'] === false && data['code'] === 200) {
          this.commonfunction.showToast('success', 'Success', 'Successfully saved');

          const objULog: UserLog = new UserLog();
          objULog.Action = 'Manage Module';
          objULog.UserId = this._auth.getUserId();
          objULog.PageName = 'menuAction';
          objULog.Notes = 'menuId=' + this.menuId;

          this.commservice.insertUserLog(objULog).subscribe(data3 => {
            // do something, success
          }, error => { alert(error); });
        } else {
          this.commonfunction.showToast('danger', 'Failed', 'Not saved');
        }
        this.loading = false;
      },
    );
  }
}
