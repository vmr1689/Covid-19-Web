import { Component, OnInit, EventEmitter, Input, Output, QueryList, ViewChildren, ViewChild, OnDestroy, AfterViewChecked } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';

import { SortEvent, NgbdSortableHeader, compare } from '../shared/directives/sortable.directive';

import { UpdatesService, SpinnerService } from '../shared/services';
import { Updatedto, ngBootstrapTable } from '../shared/models';


declare var $;

@Component({
  selector: 'app-updates',
  templateUrl: './updates.component.html',
  styleUrls: ['./updates.component.css']
})
export class UpdatesComponent implements OnInit, AfterViewChecked, OnDestroy {
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

  public currentDate = new Date();
  public model: Updatedto = {} as Updatedto;
  public updates: Updatedto[] = [];
  public updatesTable: ngBootstrapTable;
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
    this.updatesService.getAllUpdates().subscribe((response: Updatedto[]) => {
      this.updates = [];
      if (response && response.length > 0) {
        this.updates = response;
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
    const updates = [...this.updates];
    if (direction === '' || column === '') {
      this.updates = updates;
    } else {
      this.updates = [...updates].sort((a, b) => {
        const res = compare(`${a[column]}`, `${b[column]}`);
        return direction === 'asc' ? res : -res;
      });
    }
  }


  openCreateUpdates() {
    this.model = {} as Updatedto;
    this.addForm.resetForm({ ...this.model });
    $('#addUpdates').modal('toggle');
  }

  openEditUpdates(data: Updatedto) {
    this.model = { ...data };
    this.editForm.resetForm({ ...this.model });
    $('#editUpdates').modal('toggle');
  }

  openDeleteUpdates(data: Updatedto) {
    this.model = { ...data };
    $('#deleteUpdates').modal('toggle');
  }

  addUpdates(form: NgForm) {
    //this.spinnerService.show();
    this.updatesService.createUpdates(this.model).subscribe((response: any) => {
      $('#addBanner').modal('toggle');
    });
  }

  editUpdates(form: NgForm) {
    this.spinnerService.show();
    this.updatesService.editUpdates(this.model).subscribe((response: any) => {
      $('#editUpdates').modal('toggle');
    }).add(() => {
      this.spinnerService.hide();
    });
  }

  deleteUpdates(data: Updatedto) {
    this.spinnerService.show();
    this.updatesService.DeleteUpdates(data.id).subscribe((response: any) => {
      $('#deleteUpdates').modal('toggle');
    }).add(() => {
      this.spinnerService.hide();
    });
  }

  calTrig() {
    $("#bsDatepickerEdit").click();
  }

  ShowDeletedRecords() {

  }

}
