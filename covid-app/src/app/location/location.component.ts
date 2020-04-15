import { Component, OnInit, EventEmitter, Input, Output, QueryList, ViewChildren, AfterContentInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { SortEvent, NgbdSortableHeader, compare } from '../shared/directives/sortable.directive';

import { LocationService } from '../shared/services';
import { Location, ngBootstrapTable } from '../shared/models';

declare var $;



@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.css']
})
export class LocationComponent implements OnInit, AfterContentInit {

  public model: Location = {} as Location;
  public patientModel: any = {};

  public locations: Location[] = [];
  public locationTable: ngBootstrapTable;
  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;
  constructor(
    private router: Router,
    private locationService: LocationService) { }

  ngOnInit(): void {
    this.getAllLocations();
  }

  ngAfterContentInit() {

  }
  getAllLocations() {
    this.locationService.getAllLocations().subscribe((response: Location[]) => {
      this.locations = [];
      if (response && response.length > 0) {
        this.locations = response;
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

  openAddPatient(event, data) {
    event.preventDefault();
    this.patientModel = {};
    this.patientModel.placeId = data.placeId;
    this.patientModel.placeName = data.placeName;
    $('#addPatient').modal('toggle');
  }

  openQuarantinePerson(event, data) {
    event.preventDefault();
    this.patientModel = {};
    this.patientModel.placeId = data.placeId;
    this.patientModel.placeName = data.placeName;
    $('#addQuarantinePerson').modal('toggle');
  }

  openAssignedPatients(event, data: Location) {
    event.preventDefault();
    this.model = { ...data };
    this.router.navigate(['/location/' + this.model.placeId + '/patients']);
  }

  openCreateLocation(event) {
    event.preventDefault();
    this.model = {} as Location;
    $('#addLocation').modal('toggle');
  }

  openEditLocation(event, data: Location) {
    event.preventDefault();
    this.model = { ...data };
    $('#editLocation').modal('toggle');
  }

  openDeleteLocation(event, data: Location) {
    event.preventDefault();
    this.model = { ...data };
    $('#deleteLocation').modal('toggle');
  }

  
  addLocation(event, form: NgForm) {

  }

  editLocation(event, form: NgForm) {

  }

  deleteLocation(event, data: Location) {

  }

  ShowDeletedRecords() {

  }

  addPatient(event, form: NgForm) {
    $('#addPatient').modal('hide');
  }

  closeAddPatient(event) {
    event.preventDefault();
    $('#addPatient').modal('toggle');
  }

  addQuarantinePerson(event, form: NgForm) {
    $('#addQuarantinePerson').modal('hide');
  }

  closeAddQuarantinePerson(event) {
    event.preventDefault();
    $('#addQuarantinePerson').modal('toggle');
  }
}

