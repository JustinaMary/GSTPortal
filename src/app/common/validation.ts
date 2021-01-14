import { AbstractControl, FormGroup, ValidationErrors } from '@angular/forms'; //  FormControl, AbstractControl
// import * as Query from '../services/userqueries'
// import { Apollo } from 'apollo-angular';

import { Injectable } from '@angular/core';
import { CustomerService } from '../services/customer.service';
// import { UniqueCheckRM } from '../models/common-model';
import { HomeServices } from '../services/home.service';
import { GstInfoService } from '../services/gstinfo.service';


// custom validator to check that two fields match
export function MustMatch(controlName: string, matchingControlName: string) {
  return (formGroup: FormGroup) => {
    const control = formGroup.controls[controlName];
    const matchingControl = formGroup.controls[matchingControlName];

    if (matchingControl.errors && !matchingControl.errors.mustMatch) {
      // return if another validator has already found an error on the matchingControl
      return;
    }

    // set error on matchingControl if validation fails
    if (control.value !== matchingControl.value) {
      matchingControl.setErrors({ mustMatch: true });
    } else {
      matchingControl.setErrors(null);
    }
  };
}


@Injectable({
  providedIn: 'root',
})

export class Validation {
  constructor(private custservice: CustomerService, private homeService: HomeServices,
    private gstinfoservice: GstInfoService) { }

  ticketAndGstCheckValidator(str: string, isTkt: boolean) {

    return (formGroup: FormGroup) => {
      const control = formGroup.controls[str];
      if (control.value && ((control.value.length > 2 && isTkt)
        || (control.value.length > 1 && !isTkt))) {
        this.custservice.getTicketCheckValidator(control.value, isTkt).subscribe(
          (data) => {
            if (data['isError'] === false && data['code'] === 200) {
              if (data['payload'] === 'Not Valid') {
                control.setErrors({ TktValidate: true });
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

  // panCheckValidator(str: string) {

  //   return (formGroup: FormGroup) => {
  //     const control = formGroup.controls[str];
  //     if (control.value !== '' && control.value.length === 10) {
  //       this.custservice.getPanGstCheckValidator(control.value, '').subscribe(
  //         (data) => {
  //           if (data['isError'] === false && data['code'] === 200) {
  //             if (data['payload'] === 'Not Valid') {
  //               control.setErrors({ PanValidate: true });
  //             } else {
  //               return;
  //             }
  //           } else {
  //             return;
  //           }
  //         },
  //       );
  //     } else {
  //       return;
  //     }
  //   };
  // }


  // gstCheckValidator(str: string) {
  //   return (formGroup: FormGroup) => {
  //     const control = formGroup.controls[str];
  //     if (control.value !== '' && control.value.length === 15) {
  //       this.custservice.getPanGstCheckValidator('', control.value).subscribe(
  //         (data) => {
  //           if (data['isError'] === false && data['code'] === 200) {
  //             if (data['payload'] === 'Not Valid') {
  //               control.setErrors({ GstValidate: true });
  //             } else {
  //               return;
  //             }
  //           } else {
  //             return;
  //           }
  //         },
  //       );
  //     } else {
  //       return;
  //     }
  //   };
  // }

  IsAirlineExist(str: string) {
    return (formGroup: FormGroup) => {
      const ticketNo = formGroup.controls[str];
      if (ticketNo.value && ticketNo.value.length === 13) {
        this.homeService.isAirlineCodeExist(ticketNo.value).subscribe(
          (data) => {
            if (data['message'] === 'Success') {
              if (data['payload'] === true) {
                return;
              } else {
                ticketNo.setErrors({ TicketValidate: true });
              }
            }
          });
      } else {
        return;
      }
    };
  }

  isAirlineTktExistsValidation(str: string, custid: number, reqId: number) {
    return (formGroup: FormGroup) => {
      const ticketNo = formGroup.controls[str];
      // debugger;
      if (ticketNo.value && ticketNo.value.length === 13 && ticketNo.status !== 'INVALID' && reqId === 0) {
        this.gstinfoservice.getVerfAirList(custid).subscribe(
          (data) => {
            //  debugger;
            if (data['message'] === 'Success') {
              if (data['payload'].filter(x => x.digit3Code.toLowerCase() ===
                ticketNo.value.toLowerCase().substring(0, 3)).length !== 0) {
                this.homeService.isAirlineTktExistsValidation(ticketNo.value).subscribe(
                  (data1) => {
                    if (data1['message'] === 'Success') {
                      if (data1['payload'] === 'Exists') {
                        ticketNo.setErrors({ TicketAlreadyExists: true });
                      } else {
                        return;
                      }
                    }
                  });

              } else {
                //  debugger;
                if (ticketNo.status !== 'INVALID') {
                  ticketNo.setErrors({ AirlineNotRegistered: true });
                }

              }
            }
          });
      } else {
        return;
      }
    };
  }


  validateFile(name: String, fileExt: string[]) {
    const ext = name.substring(name.lastIndexOf('.') + 1);
    if (fileExt.includes(ext.toLowerCase())) {
      return true;
    } else {
      return false;
    }
  }

  IsGSTContainsPAN(gst: string) {
    return (formGroup: FormGroup) => {
      const panNo = formGroup.controls['panNo'];
      const gstNo = formGroup.controls[gst];
      if (panNo.value && panNo.value.length === 10 && gstNo.value && gstNo.value.length === 15) {
        const derivedPanNo = gstNo.value.slice(2, 12);
        if (derivedPanNo.toLowerCase() === panNo.value.toLowerCase()) {
          return;
        } else {
          gstNo.setErrors({ PANGSTValidate: true });
        }
      } else {
        return;
      }
    };
  }

  IsContactNoExist(contactNo: string, userid: string) {
    return (formGroup: FormGroup) => {
      const contactValue = formGroup.controls[contactNo];
      const useridValue = formGroup.controls[userid];
      if (contactValue.value) {
        if (contactValue.value && contactValue.value.length === 10) {
          this.homeService.isContactNoExist(contactValue.value, useridValue.value).subscribe(
            (data) => {
              if (data['message'] === 'Success' && data['payload'] === false) {
                return;
              } else {
                contactValue.setErrors({ ContactNoExist: true });
              }
            });
        } else {
          return;
        }
      }
    };
  }

}

export function PANFormatValidator(control: AbstractControl): ValidationErrors | null {
  const panNo = control.value;
  if (panNo) {
    if (panNo.pristine) {
      return null;
    }
    const PAN_REGEXP = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (PAN_REGEXP.test(panNo)) {
      return null;
    }
    return {
      'PANFormatValidator': true,
    };
  }
}

export function GSTFormatValidator(control: AbstractControl): ValidationErrors | null {
  const gstNo = control.value;
  if (gstNo) {
    if (gstNo.pristine) {
      return null;
    }
    const GST_REGEXP = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (GST_REGEXP.test(gstNo)) {
      return null;
    }

    return {
      'GSTFormatValidator': true,
    };
  }
}


export function EmailFormatValidator(control: AbstractControl): ValidationErrors | null {
  const email = control.value;
  if (email) {
    if (email.pristine) {
      return null;
    }
    // tslint:disable-next-line:max-line-length
    const EMAIL_REGEXP = /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/;
    if (EMAIL_REGEXP.test(email)) {
      return null;
    }
    return {
      'EmailFormatValidator': true,
    };
  }
}

export function GSTLast3DigitValidator(control: AbstractControl): ValidationErrors | null {
  const gstNo = control.value;
  if (gstNo) {
    if (gstNo.pristine) {
      return null;
    }
    const GST_REGEXP = /^[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (GST_REGEXP.test(gstNo)) {
      return null;
    }
    return {
      'GSTLast3DigitValidator': true,
    };
  }
}
