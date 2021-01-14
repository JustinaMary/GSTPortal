import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../../services/common.service';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
    selector: 'ngx-list-notification',
    templateUrl: './notifications.component.html',
})

export class NotificationsComponent implements OnInit {
    notifArr: Array<any> = []; // List of airline States
    firstCard = {
        news: [],
        placeholders: [],
        loading: false,
        pageToLoadNext: 1,
    };
    loading = false;
    pageSize = 10;
    hasRecords: boolean = true;

    constructor(private _common: CommonService,
        private _router: Router,
        private _auth: AuthenticationService,
    ) {
    }
    ngOnInit() {
        this.NotifyCnt();
    }

    // Get Notification Data
    loadNext(cardData) {
        if (cardData.loading) { return; }
        const toUserId = this._auth.getUserId();
        this.loading = true;
        cardData.loading = true;
        cardData.placeholders = new Array(this.pageSize);
        const startIndex = ((cardData.pageToLoadNext - 1) * this.pageSize);

        this._common.getNotificationsDataLists(toUserId, startIndex, this.pageSize).subscribe(
            (data) => {
                if (data !== null && data.length > 0) {
                    cardData.placeholders = [];
                    cardData.news.push(...data);
                    cardData.loading = false;
                    cardData.pageToLoadNext++;
                }
                this.loading = false;
            },
        );
    }

    onShow(data: string, type: number, notifyid: number) {
        const id = data;
        let idstr: string = '';

        this.NotifyUpd(notifyid); // Update notifications seen

        if (type === 12) {
            const obj = {
                reqId: id,
            };
            idstr = this._auth.encryptData(obj);
            this._router.navigate(['customerRequestDetail/' + idstr]);
        }

        if (type === 13) {
            const obj = {
                rrId: id,
            };
            idstr = this._auth.encryptData(obj);
            this._router.navigate(['raiseReqEdit/' + idstr]);
        }
    }

    NotifyCnt() {
        const toUser = this._auth.getUserId();
        this._common.getCntNotification(toUser, 0).subscribe(
            (data) => {
                if (data['isError'] === false && data['code'] === 200) {
                    this.hasRecords = (data['payload'] > 0 ? true : false);
                } else {
                    this.hasRecords = false;
                }
            },
        );
    }

    NotifyUpd(notifyid: number) {
        this._common.UpdNotificationsData(notifyid).subscribe(
            (data) => {
                if (document.getElementById('notiBellIcon').childElementCount > 1) {
                    const noticount = document.getElementById('notiBellIcon').children[1].textContent;
                    if (noticount === '1') {
                        document.getElementById('notiBellIcon').children[1].remove();
                    } else if (noticount !== '9+') {
                        document.getElementById('notiBellIcon').children[1].textContent = (+noticount - 1).toString();
                    }
                }
            },
        );
    }
}
