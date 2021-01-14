import { Component, OnDestroy } from '@angular/core';
import { NbThemeService, NbColorHelper } from '@nebular/theme';
import { CommonService } from '../../services/common.service';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'ngx-chartjs-bar2',
  template: `
    <chart type="bar" [data]="data" [options]="options"></chart>
  `,
})

export class ChartjsBarComponent implements OnDestroy {
  data: any;
  options: any;
  themeSubscription: any;

  constructor(private theme: NbThemeService,
    private commservice: CommonService,
    private _auth: AuthenticationService) {

    let type = 0;
    if (this._auth.getAirlineId() > 0) {
      type = 1;
    } else if (this._auth.getCustId() > 0) {
      type = 2;
    }


    this.themeSubscription = this.theme.getJsTheme().subscribe(config => {

      const colors: any = config.variables;
      const chartjs: any = config.variables.chartjs;

      this.commservice.getDashboardData(this._auth.getUserId(), type).subscribe(
        (data) => {
          const dataArr = [];
          if (data['message'] === 'Success') {
            // console.log(data['payload']);
            if (type !== 2 && data['payload'].downloadData !== null) {
              dataArr.push(
                {
                  data: data['payload'].uploadData,
                  label: 'Upload Count',
                  backgroundColor: NbColorHelper.hexToRgbA(colors.primaryLight, 0.8),
                },
              );
            }
            dataArr.push(
              {
                data: data['payload'].downloadData,
                label: 'Download Count',
                backgroundColor: NbColorHelper.hexToRgbA(colors.infoLight, 0.8),
              },
            );
            this.data = {
              labels: ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
              datasets: dataArr,
            };

          }
        },
      );


      this.options = {
        maintainAspectRatio: false,
        responsive: true,
        legend: {
          labels: {
            fontColor: chartjs.textColor,
          },
        },
        scales: {
          xAxes: [
            {
              gridLines: {
                display: false,
                color: chartjs.axisLineColor,
              },
              ticks: {
                fontColor: chartjs.textColor,
              },
            },
          ],
          yAxes: [
            {
              gridLines: {
                display: true,
                color: chartjs.axisLineColor,
              },
              ticks: {
                fontColor: chartjs.textColor,
              },
            },
          ],
        },
      };
    });
  }

  ngOnDestroy(): void {
    this.themeSubscription.unsubscribe();
  }
}
