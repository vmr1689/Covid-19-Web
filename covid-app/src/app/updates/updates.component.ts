import { Component, OnInit, EventEmitter, Input, Output, QueryList, ViewChildren, AfterViewInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { SortEvent, NgbdSortableHeader, compare } from '../shared/directives/sortable.directive';

import { UpdatesService } from '../shared/services';
import { Updatedto, ngBootstrapTable } from '../shared/models';

declare var $;

@Component({
  selector: 'app-updates',
  templateUrl: './updates.component.html',
  styleUrls: ['./updates.component.css']
})
export class UpdatesComponent implements OnInit, AfterViewInit {
  public currentDate = new Date();
  public model: Updatedto = {} as Updatedto;
  public updates: Updatedto[] = [];
  public updatesTable: ngBootstrapTable;
  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;

  constructor(
    private router: Router,
    private updatesService: UpdatesService) { }

  ngOnInit(): void {
    
    this.getAllBanners();
  }

  ngAfterViewInit() {
     //Date picker
     $('#datepicker').datepicker({
      autoclose: true
    })
  }
  getAllBanners() {
    this.updatesService.getAllUpdates().subscribe((response: Updatedto[]) => {
      this.updates = [];
      if (response && response.length > 0) {
        this.updates = response;
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
    $('#addUpdates').modal('toggle');
  }

  openEditUpdates(data: Updatedto) {
    this.model = { ...data };
    $('#editUpdates').modal('toggle');
  }

  openDeleteUpdates(data: Updatedto) {
    this.model = { ...data };
    $('#deleteUpdates').modal('toggle');
  }

  addUpdates(form: NgForm) {
    this.updatesService.createUpdates(this.model).subscribe((response: any) => {
      $('#addBanner').modal('toggle');
    });
  }

  editUpdates(form: NgForm) {
    this.updatesService.editUpdates(this.model).subscribe((response: any) => {
      $('#editUpdates').modal('toggle');
    });
  }

  deleteUpdates(data: Updatedto) {
    this.updatesService.DeleteUpdates(data.id).subscribe((response: any) => {
      $('#deleteUpdates').modal('toggle');
    });
  }

  calTrig() {
    $("#bsDatepickerEdit").click();
  }

  ShowDeletedRecords() {

  }

}
