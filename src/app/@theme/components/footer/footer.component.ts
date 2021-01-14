import { Component } from '@angular/core';

@Component({
  selector: 'ngx-footer',
  styleUrls: ['./footer.component.scss'],
  template: `
    <span class="created-by">
    </span>
    <div class="socials">
    <p class="poweredby">Powered By : <a href="https://www.airlinegst.com/" target="_blank">AirlineGST</a></p>
    </div>
  `,
})
export class FooterComponent {
}
