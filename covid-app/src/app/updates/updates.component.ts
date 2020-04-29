import { Component, OnInit, ViewChild, OnDestroy, AfterViewChecked } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';

import * as Helpers from '../shared/helpers';
import { UpdatesService, SpinnerService } from '../shared/services';
import { Updatedto } from '../shared/models';

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

  constructor(
    private spinnerService: SpinnerService,
    private updatesService: UpdatesService) { }

  ngOnInit(): void {
    this.getAllUpdates();
  }

  ngAfterViewChecked() {
    $('.dataTables_filter input, .dataTables_length select').addClass('form-control');
  }

  ngOnDestroy(): void {
    if (this.dtTrigger) {
      this.dtTrigger.unsubscribe();
    }
  }

  getAllUpdates() {
    this.spinnerService.show();
    this.updatesService.getAllUpdates().subscribe((response: Updatedto[]) => {
      this.updates = [];
      if (response && response.length > 0) {
        this.updates = response;
        this.updates.map(x => {
          if (x.timestamp) {
            x.dateStr = Helpers.getDateFromTimeStamp(x.timestamp);
            x.date = new Date(Number(x.timestamp) * 1000);
          }
        });
      }
      this.rerender();
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

  openCreateUpdates() {
    this.model = {} as Updatedto;
    this.currentDate = new Date();
    this.model.date = new Date();
    this.addForm.resetForm({ ...this.model });
    $('#addUpdates').modal('toggle');
  }

  openEditUpdates(data: Updatedto) {
    this.model = { ...data };
    this.model.date = data.date;
    this.currentDate = data.date;
    this.editForm.resetForm({ ...this.model });
    $('#editUpdates').modal('toggle');
  }

  openDeleteUpdates(data: Updatedto) {
    this.model = { ...data };
    $('#deleteUpdates').modal('toggle');
  }

  addUpdates(form: NgForm) {
    this.model.date = this.currentDate;
    this.model.timestamp = Helpers.getTimeStampFromDate(new Date(this.model.date));
    this.spinnerService.show();
    this.updatesService.createUpdates(this.model).subscribe((response: any) => {
      $('#addUpdates').modal('toggle');
    }).add(() => {
      this.spinnerService.hide();
      this.getAllUpdates();
    });
  }

  editUpdates(form: NgForm) {
    this.model.date = this.currentDate;
    this.model.timestamp = Helpers.getTimeStampFromDate(new Date(this.model.date));
    this.spinnerService.show();
    this.updatesService.editUpdates(this.model).subscribe((response: any) => {
      $('#editUpdates').modal('toggle');
    }).add(() => {
      this.spinnerService.hide();
      this.getAllUpdates();
    });
  }

  deleteUpdates(data: Updatedto) {
    this.spinnerService.show();
    this.updatesService.DeleteUpdates(data.id).subscribe((response: any) => {
      $('#deleteUpdates').modal('toggle');
    }).add(() => {
      this.spinnerService.hide();
      this.getAllUpdates();
    });
  }

  calTrig() {
    $('#bsDatepickerAdd').click();
  }

  calTrig1() {
    $('#bsDatepickerEdit').click();
  }
}
