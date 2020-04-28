import { Component, OnInit, OnDestroy, AfterViewChecked, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';

import { LOCATION_TYPES, GENDER_TYPES } from '.././seedConfig';
import { environment } from '../../environments/environment';
import { LocationService, SpinnerService } from '../shared/services';
import { Location, LocationTypes, LocationPatient, LocationQuarantine, GenderTypes } from '../shared/models';

declare var $;

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.css']
})
export class LocationComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild(DataTableDirective, { static: false }) dtElement: DataTableDirective;
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
  public patientModel: LocationPatient = {} as LocationPatient;

  public tableLocations: Location[] = [];
  public locations: Location[] = [];
  public rootLocations: Location[] = [];
  public types: LocationTypes[] = LOCATION_TYPES;
  public genderTypes: GenderTypes[] = GENDER_TYPES;

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


    this.locationService.getAllLocationsDuplicate(environment.targetLocation).subscribe((response: Location) => {
      this.locations = [];
      this.tableLocations = [];
      this.rootLocations = [];
      if (response) {
        let result = this.restructureData(response);
        this.locations = [...result];
        this.rootLocations = [...result];
        this.tableLocations = [...result];
        this.rootLocations = this.rootLocations.sort((a, b) => a.placeName < b.placeName ? -1 : a.placeName > b.placeName ? 1 : 0);
      }
      this.rerender();
    }).add(() => {
      this.spinnerService.hide();
    });
  }

  restructureData(response: Location) {
    const resCopy = { ...response };
    let result: Location[] = [];
    resCopy.istarget = resCopy.type == 'Country';
    result.push(resCopy);

    if (Array.isArray(response.subordinates)) {
      result = result.concat(this.flatData(response.subordinates, response));
    }
    return result;
  }

  flatData(subordinates: Location[], root: Location) {
    let result: Location[] = [];

    const subor = [...subordinates];
    subor.forEach((sub) => {
      const subCopy = { ...sub };
      subCopy.root = root;
      subCopy.rootId = root.placeId;
      result.push(subCopy);
      if (Array.isArray(sub.subordinates)) {
        result = result.concat(this.flatData(sub.subordinates, sub));
      }
    });
    return result;
  }

  rerender(): void {
    const self = this;
    if (this.isDtInitialized) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
        setTimeout(() => {
          this.dtTrigger.next();
        });
      });
    } else {
      this.isDtInitialized = true;
      this.dtTrigger.next();
    }
  }

  openAddPatient(data) {
    debugger;
    this.patientModel = {} as LocationPatient;
    this.patientModel.placeId = data.placeId;
    this.patientModel.confirmed = true;
    this.patientModel.active = true;
    this.patientModel.placeName = data.placeName;
    this.addPatientForm.resetForm({ ...this.patientModel });
    $('#addPatient').modal('toggle');
  }

  openQuarantinePerson(data) {
    this.patientModel = {} as LocationPatient;
    this.patientModel.placeId = data.placeId;
    this.patientModel.quarantined = true;
    this.patientModel.placeName = data.placeName;
    this.addQuarantineForm.resetForm({ ...this.patientModel });
    $('#addQuarantinePerson').modal('toggle');
  }

  openAssignedPatients(data: Location) {
    this.model = { ...data };
    this.router.navigate(['/location/' + this.model.placeId + '/patients']);
  }

  openCreateLocation() {
    this.model = {} as Location;
    this.addForm.resetForm({ ...this.model });
    $('#addLocation').modal('toggle');
  }

  openEditLocation(data: Location) {
    this.model = { ...data };
    this.editForm.resetForm({ ...this.model });
    $('#editLocation').modal('toggle');
  }

  openDeleteLocation(data: Location) {
    this.model = { ...data };
    $('#deleteLocation').modal('toggle');
  }


  addLocation(form: NgForm) {
    const model = { ...this.model };
    let rootName = '';
    if (model.rootId) {
      const root = this.rootLocations.find(x => x.placeId == model.rootId);
      if (root) {
        rootName = root.placeName;
      }
    }

    this.spinnerService.show();
    this.locationService.createLocation(model, rootName).subscribe((response: any) => {
    }).add(() => {
      $('#addLocation').modal('toggle');
      this.spinnerService.hide();
      this.getAllLocations();
    });
  }

  editLocation(form: NgForm) {

  }

  deleteLocation(data: Location) {

  }

  addPatient(form: NgForm) {
    const patientModel = { ...this.patientModel };
    this.spinnerService.show();

    this.locationService.createPatient(patientModel).subscribe((response: any) => {
    }).add(() => {
      $('#addPatient').modal('toggle');
      this.spinnerService.hide();
      this.getAllLocations();
    });
  }


  addQuarantinePerson(form: NgForm) {
    $('#addQuarantinePerson').modal('hide');
  }

}

