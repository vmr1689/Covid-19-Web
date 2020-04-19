import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { HelplinkService, SpinnerService } from '../shared/services';
import { HelpLink } from '../shared/models';

@Component({
  selector: 'app-links',
  templateUrl: './links.component.html',
  styleUrls: ['./links.component.css']
})
export class LinksComponent implements OnInit {

  public helpLinks: HelpLink[] = [];

  constructor(
    private spinnerService: SpinnerService,
    private router: Router,
    private helplinkService: HelplinkService) { }

  ngOnInit(): void {
    this.getAllHelpLinks();
  }

  getAllHelpLinks() {
    this.spinnerService.show();
    this.helplinkService.getAllHelpLinks().subscribe((response: HelpLink[]) => {
      this.helpLinks = [];
      if (response && response.length > 0) {
        this.helpLinks = response;
      }
    }).add(() => {
      this.spinnerService.hide();
    });
  }

  openHelpLink(link: any) {
    window.open(link, '_blank');
  }

}
