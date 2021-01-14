// import * as Query from '../services/userqueries'
import * as CryptoJS from 'crypto-js';
import {
 // CookieService,
} from 'ngx-cookie-service';

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  encryptSecretKey = 'pikateck';
  constructor(
    // private cookieService: CookieService,
  ) { }

  logout() {
    localStorage.removeItem('logdata');
    // this.cookieService.deleteAll( '/ ',  '/' );
    // this.cookieService.deleteAll();
  }
  public get loggedIn(): boolean {
    return (localStorage.getItem('logdata') !== null);
    // return (this.cookieService.get('logdata') !== '');
  }


  encryptData(data) {
    try {
      let outstr: string = '';
      outstr = CryptoJS.AES.encrypt(JSON.stringify(data), this.encryptSecretKey).toString();
      outstr = outstr.replace(/\//g, '_').replace(/\+/g, '-').replace(/\&/g, '__');
      return outstr;
    } catch (e) {
      // console.log(e);
    }
  }

  decryptData(data) {
    try {
      data = data.replace(/\_/g, '/').replace(/\-/g, '+').replace(/__/g, '&');
      const bytes = this.replaceDecryptStr(data); // CryptoJS.AES.decrypt(data, this.encryptSecretKey);
      if (bytes.toString()) {
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      }
      return data;
    } catch (e) {
      // console.log(e);
    }
  }

  replaceDecryptStr(data) {
    data = data.replace(/\_/g, '/').replace(/\-/g, '+').replace(/__/g, '&');
    return CryptoJS.AES.decrypt(data, this.encryptSecretKey);
  }

  getUserId() {
    // if (this.cookieService.get('logdata') !== '') {
    if (localStorage.getItem('logdata') !== null) {
      let menuArr: Array<any> = [];
      // const bytes = this.replaceDecryptStr(this.cookieService.get('logdata'));
      const bytes = this.replaceDecryptStr(localStorage.getItem('logdata'));
      if (bytes.toString()) {
        menuArr = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        return menuArr['userId'];
      }
    } else {
      return '';
    }
  }

  getUserProfilePic() {

    // if (this.cookieService.get('logdata') !== '') {
    if (localStorage.getItem('logdata') !== null) {
      let menuArr: Array<any> = [];
      // const bytes = this.replaceDecryptStr(this.cookieService.get('logdata'));
      const bytes = this.replaceDecryptStr(localStorage.getItem('logdata'));
      if (bytes.toString()) {
        menuArr = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        return menuArr['profileImg'];
      }
    } else {
      return '';
    }


  }

  getUserName() {
    // if (this.cookieService.get('logdata') !== '') {
    if (localStorage.getItem('logdata') !== null) {
      let menuArr: Array<any> = [];
      // const bytes = this.replaceDecryptStr(this.cookieService.get('logdata'));
      const bytes = this.replaceDecryptStr(localStorage.getItem('logdata'));
      if (bytes.toString()) {
        menuArr = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        return menuArr['username'];
      }
    } else {
      return '';
    }


  }

  getAccToken() {
    // if (this.cookieService.get('logdata') !== '') {
    if (localStorage.getItem('logdata') !== null) {
      let menuArr: Array<any> = [];
      // const bytes = this.replaceDecryptStr(this.cookieService.get('logdata'));
      const bytes = this.replaceDecryptStr(localStorage.getItem('logdata'));
      if (bytes.toString()) {
        menuArr = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        return menuArr['accessToken'];
      }
    } else {
      return '';
    }
  }

  getRefToken() {
    // if (this.cookieService.get('logdata') !== '') {
    if (localStorage.getItem('logdata') !== null) {
      let menuArr: Array<any> = [];
      // const bytes = this.replaceDecryptStr(this.cookieService.get('logdata'));
      const bytes = this.replaceDecryptStr(localStorage.getItem('logdata'));
      if (bytes.toString()) {
        menuArr = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        return menuArr['refreshToken'];
      }
    } else {
      return '';
    }
  }

  getIp() {
    // if (this.cookieService.get('logdata') !== '') {
    if (localStorage.getItem('logdata') !== null) {
      let menuArr: Array<any> = [];
      // const bytes = this.replaceDecryptStr(this.cookieService.get('logdata'));
      const bytes = this.replaceDecryptStr(localStorage.getItem('logdata'));
      if (bytes.toString()) {
        menuArr = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        return menuArr['ipAddress'];
      }
    } else {
      return '';
    }
  }

  isAccessTokenExpired() {
    // if (this.cookieService.get('logdata') !== '') {
    if (localStorage.getItem('logdata') !== null) {
      let menuArr: Array<any> = [];
      // const bytes = this.replaceDecryptStr(this.cookieService.get('logdata'));
      const bytes = this.replaceDecryptStr(localStorage.getItem('logdata'));
      if (bytes.toString()) {
        menuArr = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        return (new Date(menuArr['tokenExpiry']) < new Date());
      }
    } else {
      return true;
    }
  }


  getAirlineId() {
    // if (this.cookieService.get('logdata') !== '') {
    if (localStorage.getItem('logdata') !== null) {
      let menuArr: Array<any> = [];
      // const bytes = this.replaceDecryptStr(this.cookieService.get('logdata'));
      const bytes = this.replaceDecryptStr(localStorage.getItem('logdata'));
      if (bytes.toString()) {
        menuArr = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        return menuArr['airlineId'];
      }
    } else {
      return 0;
    }
  }
  getCustId() {
    // if (this.cookieService.get('logdata') !== '') {
    if (localStorage.getItem('logdata') !== null) {
      let menuArr: Array<any> = [];
      // const bytes = this.replaceDecryptStr(this.cookieService.get('logdata'));
      const bytes = this.replaceDecryptStr(localStorage.getItem('logdata'));
      if (bytes.toString()) {
        menuArr = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        return menuArr['custId'];
      }
    } else {
      return 0;
    }
  }
  getRoleName() {
    // if (this.cookieService.get('logdata') !== '') {
    if (localStorage.getItem('logdata') !== null) {
      let menuArr: Array<any> = [];
      // const bytes = this.replaceDecryptStr(this.cookieService.get('logdata'));
      const bytes = this.replaceDecryptStr(localStorage.getItem('logdata'));
      if (bytes.toString()) {
        menuArr = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        return menuArr['rolenames'];
      } else {
        return '';
      }
    }
  }


  saveToken(at: string, rt: string, ed: string) {
    let menuArr: Array<any> = [];
    // const bytes = this.replaceDecryptStr(this.cookieService.get('logdata'));
      const bytes = this.replaceDecryptStr(localStorage.getItem('logdata'));
    if (bytes.toString()) {
      menuArr = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      menuArr['accessToken'] = at;
      menuArr['refreshToken'] = rt;
      menuArr['tokenExpiry'] = ed;
      localStorage.removeItem('logdata');
      localStorage.setItem('logdata', this.encryptData(menuArr));
      // this.cookieService.deleteAll();
      // this.cookieService.set('logdata', this.encryptData(menuArr));
    }
  }

}
