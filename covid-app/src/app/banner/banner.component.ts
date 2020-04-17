import { Component, OnInit, EventEmitter, Input, Output, QueryList, ViewChildren, ViewChild, OnDestroy, AfterViewChecked } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';

import { SortEvent, NgbdSortableHeader, compare } from '../shared/directives/sortable.directive';

import { UpdatesService, SpinnerService } from '../shared/services';
import { Banner, ngBootstrapTable } from '../shared/models';

declare var $;

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.css']
})
export class BannerComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild(DataTableDirective, { static: false }) dtElement: DataTableDirective;
  @ViewChild('addForm') addForm: NgForm;
  @ViewChild('editForm') editForm: NgForm;
  public dtOptions: DataTables.Settings = {
    autoWidth: false,
    jQueryUI: true,
    dom: '<"pull-left"f><"pull-right"l>tip',
  };
  public dtTrigger = new Subject();
  public isDtInitialized = false;

  public model: Banner = {} as Banner;

  public banners: Banner[] = [];
  public bannerTable: ngBootstrapTable;
  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;

  constructor(
    private spinnerService: SpinnerService,
    private router: Router,
    private updatesService: UpdatesService) { }

  ngOnInit(): void {
    this.getAllBanners();
  }

  ngAfterViewChecked() {
    $('.dataTables_filter input, .dataTables_length select').addClass('form-control');
  }

  ngOnDestroy(): void {
    if (this.dtTrigger) {
      this.dtTrigger.unsubscribe();
    }
  }
  getAllBanners() {
    this.spinnerService.show();
    this.updatesService.getAllBanners().subscribe((response: Banner[]) => {
      this.banners = [];
      if (response && response.length > 0) {
        this.banners = response;
        this.rerender();
      }
    }).add(() => {
      this.spinnerService.hide();
    });
  }

  rerender(): void {
    if (this.isDtInitialized) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
        this.dtTrigger.next();
      });
    } else {
      this.isDtInitialized = true;
      this.dtTrigger.next();
    }
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
    this.addForm.resetForm();
    this.model = {} as Banner;
    $('#addBanner').modal('toggle');
  }

  openEditBanner(data: Banner) {
    this.editForm.resetForm();
    this.model = { ...data };
    $('#editBanner').modal('toggle');
  }

  openDeleteBanner(data: Banner) {
    this.model = { ...data };
    $('#deleteBanner').modal('toggle');
  }

  addBanner(form: NgForm) {
    this.spinnerService.show();
    this.updatesService.createBanner(this.model).subscribe((response: any) => {
      $('#addBanner').modal('toggle');
    }).add(() => {
      this.spinnerService.hide();
    });
  }

  editBanner(form: NgForm) {
    this.spinnerService.show();
    this.updatesService.editBanner(this.model).subscribe((response: any) => {
      $('#editBanner').modal('toggle');
    }).add(() => {
      this.spinnerService.hide();
    });
  }

  deleteBanner(data: Banner) {
    this.spinnerService.show();
    this.updatesService.deleteBanner(data.id).subscribe((response: any) => {
      $('#deleteBanner').modal('toggle');
    }).add(() => {
      this.spinnerService.hide();
    });
  }

  ShowDeletedRecords() {

  }

}
