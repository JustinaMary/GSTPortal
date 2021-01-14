// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
 // import { Component, OnInit } from '@angular/core';
// import { MustMatch } from '../../common/validation';
// import Swal from 'sweetalert2';
// import { AccountsService } from '../../services/accounts.service';
// import { ResetPasswordInternalVm } from '../../models/accounts-model';
// import { AuthenticationService } from '../../services/authentication.service';
// import { Router } from '@angular/router';
// import { CommonFunction } from '../../common/common-functions';

import { Component, ViewChild } from '@angular/core';

@Component({
  // selector: 'ngx-accordion',
  // templateUrl: 'accordion.component.html',
  styleUrls: ['faq.component.scss'],
  selector: 'ngx-faq',
  templateUrl: './faq.component.html',
})
export class FaqComponent {

  @ViewChild('item', { static: true }) accordion;

  // toggle() {
  //   this.accordion.toggle();
  // }
}
