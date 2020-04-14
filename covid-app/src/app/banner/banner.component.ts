import { Component, OnInit, EventEmitter, Input, Output, QueryList, ViewChildren } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { SortEvent, NgbdSortableHeader, compare } from '../shared/directives/sortable.directive';

import { UpdatesService } from '../shared/services';
import { Banner, ngBootstrapTable } from '../shared/models';

declare var $;

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.css']
})
export class BannerComponent implements OnInit {

  public model: Banner = {} as Banner;

  public banners: Banner[] = [];
  public bannerTable: ngBootstrapTable;
  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;
  constructor(
    private router: Router,
    private updatesService: UpdatesService) { }

  ngOnInit(): void {
    this.getAllBanners();
  }

  getAllBanners() {
    this.updatesService.getAllBanners().subscribe((response: Banner[]) => {
      this.banners = [];
      if (response && response.length > 0) {
        this.banners = response;
      }
    });
  }

  onSort({ column, direction }: SortEvent) {

    // resetting other headers
    this.headers.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    // sorting countries
    const banners = [...this.banners];
    if (direction === '' || column === '') {
      this.banners = banners;
    } else {
      this.banners = [...banners].sort((a, b) => {
        const res = compare(`${a[column]}`, `${b[column]}`);
        return direction === 'asc' ? res : -res;
      });
    }
  }


  openCreateBanner() {
    this.model = {} as Banner;
    $('#addBanner').modal('toggle');
  }

  openEditBanner(data: Banner) {
    this.model = { ...data };
    $('#editBanner').modal('toggle');
  }

  openDeleteBanner(data: Banner) {
    this.model = { ...data };
    $('#deleteBanner').modal('toggle');
  }

  addBanner(form: NgForm) {
    this.updatesService.createBanner(this.model).subscribe((response: any) => {
      $('#addBanner').modal('toggle');
    });
  }

  editBanner(form: NgForm) {
    this.updatesService.editBanner(this.model).subscribe((response: any) => {
      $('#editBanner').modal('toggle');
    });
  }

  deleteBanner(data: Banner) {
    this.updatesService.deleteBanner(data.id).subscribe((response: any) => {
      $('#deleteBanner').modal('toggle');
    });
  }

  ShowDeletedRecords() {

  }

}
