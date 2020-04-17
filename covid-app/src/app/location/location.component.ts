import { Component, OnInit, OnDestroy, QueryList, ViewChildren, AfterViewChecked, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';

import { SortEvent, NgbdSortableHeader, compare } from '../shared/directives/sortable.directive';

import { LocationService, SpinnerService } from '../shared/services';
import { Location, ngBootstrapTable } from '../shared/models';

declare var $;

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.css']
})
export class LocationComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild(DataTableDirective, { static: false }) dtElement: DataTableDirective;
  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;
  @ViewChild('addForm') addForm: NgForm;
  @ViewChild('editForm') editForm: NgForm;
  @ViewChild('addPatientForm') addPatientForm: NgForm;
  @ViewChild('addQuarantineForm') addQuarantineForm: NgForm;
  public isDtInitialized = false;

  public dtOptions: DataTables.Settings = {
    autoWidth: false,
    jQueryUI: true,
    dom: '<"pull-left"f><"pull-right"l>tip',
    order: ['9']
  };
  public dtTrigger = new Subject();

  public model: Location = {} as Location;
  public patientModel: any = {};

  public locations: Location[] = [];
  public locationTable: ngBootstrapTable;

  constructor(
    private spinnerService: SpinnerService,
    private router: Router,
    private locationService: LocationService) { }

  ngOnInit(): void {
    this.getAllLocations();
  }

  ngAfterViewChecked() {
    $('.dataTables_filter input, .dataTables_length select').addClass('form-control');
  }

  ngOnDestroy(): void {
    if (this.dtTrigger) {
      this.dtTrigger.unsubscribe();
    }
  }

  getAllLocations() {
    this.spinnerService.show();
    this.locationService.getAllLocations().subscribe((response: Location[]) => {
      this.locations = [];
      if (response && response.length > 0) {
        this.locations = response;
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
    const locations = [...this.locations];
    if (direction === '' || column === '') {
      this.locations = locations;
    } else {
      this.locations = [...locations].sort((a, b) => {
        const res = compare(`${a[column]}`, `${b[column]}`);
        return direction === 'asc' ? res : -res;
      });
    }
  }

  openAddPatient(data) {
    this.addPatientForm.resetForm();
    this.patientModel = {};
    this.patientModel.placeId = data.placeId;
    this.patientModel.confirmed = true;
    this.patientModel.active = true;
    this.patientModel.placeName = data.placeName;
    $('#addPatient').modal('toggle');
  }

  openQuarantinePerson(data) {
    this.addQuarantineForm.resetForm();
    this.patientModel = {};
    this.patientModel.placeId = data.placeId;
    this.patientModel.quarantined = true;
    this.patientModel.placeName = data.placeName;
    $('#addQuarantinePerson').modal('toggle');
  }

  openAssignedPatients(data: Location) {
    this.model = { ...data };
    this.router.navigate(['/location/' + this.model.placeId + '/patients']);
  }

  openCreateLocation() {
    this.addForm.resetForm();
    this.model = {} as Location;
    $('#addLocation').modal('toggle');
  }

  openEditLocation(data: Location) {
    this.editForm.resetForm();
    this.model = { ...data };
    $('#editLocation').modal('toggle');
  }

  openDeleteLocation(data: Location) {
    this.model = { ...data };
    $('#deleteLocation').modal('toggle');
  }


  addLocation(form: NgForm) {

  }

  editLocation(form: NgForm) {

  }

  deleteLocation(data: Location) {

  }

  ShowDeletedRecords() {

  }

  addPatient(form: NgForm) {
    $('#addPatient').modal('hide');
  }


  addQuarantinePerson(form: NgForm) {
    $('#addQuarantinePerson').modal('hide');
  }

}

