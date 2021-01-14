import { FormGroup } from '@angular/forms';
import { Injectable } from '@angular/core';
import {
  NbComponentStatus,
  NbGlobalPhysicalPosition,
  NbToastrService,
} from '@nebular/theme';
import { CommonService } from '../services/common.service';
import { UniqueCheckRM, ErrorLog } from '../models/common-model';

@Injectable({
  providedIn: 'root',
})

export class CommonFunction {
  constructor(private toastrService: NbToastrService, private commonServ: CommonService) { }

  showToast(type: NbComponentStatus, title: string, body: string) {

    let durationTime = 2500;
    if (type === 'danger') {
      durationTime = 5000;
    }
    const config = {
      status: type,
      destroyByClick: true,
      duration: durationTime,
      hasIcon: true,
      position: NbGlobalPhysicalPosition.TOP_RIGHT,
      preventDuplicates: false,
    };
    const titleContent = title ? `${title}` : '';

    this.toastrService.show(
      body,
      `${titleContent}`,
      config);
  }

  UniqueCheck(colName: string, tableNm: string, pid: string, fid: string) {

    return (formGroup: FormGroup) => {
      const control = formGroup.controls[colName];
      const keycontrol = formGroup.controls[pid];
      if (control.value !== '') {
        const obj: UniqueCheckRM = new UniqueCheckRM();
        obj.Tablename = tableNm;
        obj.Columnvalue = control.value;
        obj.Pid = Number(keycontrol.value);
        obj.Fid = Number(fid);

        this.commonServ.getUniqueCheckData(obj).subscribe(
          (data) => {
            if (data['isError'] === false && data['code'] === 200) {
              if (data['payload'] === 'Exists') {
                control.setErrors({ dataUnique: true });
              } else {
                return;
              }
            } else {
              return;
            }
          },
        );
      } else {
        return;
      }
    };
  }

  UniqueEmailCheck(Email: string, pid: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[Email];
      const Pcontrol = formGroup.controls[pid];
      if (control.value && Pcontrol.value) {
        if (control.value !== '' && Pcontrol.value !== '') {

          this.commonServ.getUniqueEmailCheckData(control.value, Pcontrol.value).subscribe(
            (data) => {
              if (data['isError'] === false && data['code'] === 200) {
                if (data['payload'] === 'Exists') {
                  control.setErrors({ EmailUnique: true });
                } else {
                  return;
                }
              } else {
                return;
              }
            },
          );
        } else {
          return;
        }
      }

    };
  }

  EmailDomainCheck(Email: string, custId: number) {
    return (formGroup: FormGroup) => {
      const emailValue = formGroup.controls[Email];
      if (emailValue.value) {
        if (emailValue.value !== '' && custId > 0) {
          this.commonServ.getCustomerEmailDomain(custId).subscribe(
            (data) => {
              if (data['isError'] === false && data['code'] === 200) {
                const email = data['payload'].split('@');
                const emailValues = emailValue.value.split('@');
                if (email[1] === emailValues[1]) {
                  return;
                } else {
                  emailValue.setErrors({ serverError: 'Kindly enter the email of domain ' + email[1] });
                  // emailValue.setErrors({ EmailDomain: 'Kindly enter the email of domain ' + email[1] });
                }
              } else {
                return;
              }
            },
          );
        } else {
          return;
        }
      }

    };
  }

  UniqueUserNameCheck(pid: string, id: number, code: string, userNm: string, Type: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[userNm];
      const Pcontrol = formGroup.controls[pid];
      const codecontrol = formGroup.controls[code];
      if (control.value !== '' && Pcontrol.value === 0) {
        const userNameStr: string = control.value;
        this.commonServ.getUniqueUserNameCheckData(
          id, codecontrol.value + '_' + control.value, Type).subscribe(
            (data) => {
              if (data['isError'] === false && data['code'] === 200) {
                if (data['payload'] === 'Exists' || userNameStr.toLowerCase() === 'admin') {
                  control.setErrors({ UserNmUnique: true });
                } else {
                  return;
                }
              } else {
                return;
              }
            },
          );
      } else {
        return;
      }
    };
  }

  ErrorLogHdlFunc(message: string, userid: string) {
    const objMain: ErrorLog = new ErrorLog();
    objMain.message = message;
    objMain.Id = userid;
    objMain.CreatedOn = '';
    this.commonServ.ErrorLogHandle(objMain).subscribe(
      (data) => {
        if (data['isError'] === false && data['code'] === 200) {
          if (data['payload'] === 'Error saved') {
            return 'success';
          } else {
            return 'fail';
          }
        } else {
          return 'fail';
        }
      },
    );
  }
}
