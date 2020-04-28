import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as fileSaver from 'file-saver';

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
        response.forEach(e => {
          if (e.type == 'document' && e.fileName) {
            this.helpLinks.push(e);
          } else {
            if (e.link) {
              this.helpLinks.push(e);
            }
          }
        });
      }
    }).add(() => {
      this.spinnerService.hide();
    });
  }

  openHelpLink(data: HelpLink) {
    const link = data.link;
    window.open(link, '_blank');
  }

  openHelpDocument(data: any) {
    this.spinnerService.show();
    this.helplinkService.downloadFile(data.covidLinkId).subscribe(response => {
      const blob: any = new Blob([response], { type: response.type });
      //const url = window.URL.createObjectURL(blob);
      //window.open(url);
      fileSaver.saveAs(blob, data.fileName);
    }).add(() => {
      this.spinnerService.hide();
    });
  }
}
