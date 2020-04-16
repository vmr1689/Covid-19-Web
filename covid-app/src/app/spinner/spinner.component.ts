import { Component, OnInit } from '@angular/core';
import { SpinnerService } from '../shared/services';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.css']
})
export class SpinnerComponent implements OnInit {

  public showSpinner: boolean;

  constructor(public spinnerService: SpinnerService) { }

  ngOnInit(): void {
    const that = this;
    this.spinnerService.loadingStatus$.subscribe((loading) => {
      that.showSpinner = loading;
    });
  }
}
