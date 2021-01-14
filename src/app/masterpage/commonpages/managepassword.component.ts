import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MustMatch } from '../../common/validation';
import Swal from 'sweetalert2';
import { AccountsService } from '../../services/accounts.service';
import { ManagePasswordVm } from '../../models/accounts-model';
import { AuthenticationService } from '../../services/authentication.service';


@Component({
  selector: 'ngx-managepassword',
  templateUrl: './managepassword.component.html',
})
export class ManagePasswordComponent implements OnInit {
  manageForm: FormGroup;
  submitted = false;
  title = 'Manage Password';
  sub: any;

  @Input() AirlineId: number;

  constructor(private accservice: AccountsService, private formBuilder: FormBuilder,
    private _auth: AuthenticationService ) { }
  ngOnInit() {
    this.manageForm = this.formBuilder.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required,
      Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{8,}')]],
      confirmPassword: ['', [Validators.required]],
    }, {
      validator: [
        MustMatch('newPassword', 'confirmPassword'),
      ],
    });
  }

  get f() { return this.manageForm.controls; }
  managePassword() {

    Swal.fire({
      title: 'Are you sure?',
      text: 'You will have to re-login with new password!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, change it!',
    }).then((result) => {
      if (result.value) {
        // debugger;
        const objManagePw: ManagePasswordVm = new ManagePasswordVm();
        objManagePw.UserId = this._auth.getUserId();
        objManagePw.OldPassword = this.manageForm.controls['oldPassword'].value,
        objManagePw.NewPassword = this.manageForm.controls['newPassword'].value,


        this.accservice.managePassword(objManagePw).subscribe(
          (data) => {
            // debugger;
            setTimeout(() => {
              this._auth.logout();
              location.href = '/';
            }, 9000);


            if (data['payload'].isSuccess) {
              Swal.fire(
                'Changed!',
                'Password changed successsfully.',
                'success',
              );
              setTimeout(() => {
                this._auth.logout();
                location.href = '/';
              }, 2000);
            } else {
              document.getElementById('manageErrMsg').innerHTML = data['payload'].message;
              document.getElementById('manageErrMsg').style.display = 'block';

              setTimeout(() => {
                document.getElementById('manageErrMsg').style.display = 'none';
              }, 5000);
            }

          },
        );



      }
    });

  }

  onSubmitManageForm() {
    this.submitted = true;
    if (this.manageForm.invalid) {
      return;
    }
    this.managePassword();
  }

  onReset() {
    this.submitted = false;
    this.manageForm.reset();
  }

  // onList(): void {
  //   this._router.navigate(['airlineList']);
  // }
}
