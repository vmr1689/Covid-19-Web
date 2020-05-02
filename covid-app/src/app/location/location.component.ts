import { Component, OnInit, OnDestroy, AfterViewChecked, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';

import * as Helpers from '../shared/helpers';
import { LOCATION_TYPES, GENDER_TYPES } from '.././seedConfig';
import { environment } from '../../environments/environment';
import { LocationService, SpinnerService, AuthenticationService } from '../shared/services';
import { Location, User, LocationTypes, LocationPatient, LocationQuarantine, GenderTypes, Select2DropDown } from '../shared/models';

declare var $;

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.css']
})
export class LocationComponent implements OnInit, AfterViewChecked, AfterViewInit, OnDestroy {
  @ViewChild(DataTableDirective, { static: false }) dtElement: DataTableDirective;
  @ViewChild('addForm') addForm: NgForm;
  @ViewChild('editForm') editForm: NgForm;
  @ViewChild('addPatientForm') addPatientForm: NgForm;
  @ViewChild('addQuarantineForm') addQuarantineForm: NgForm;
  public isDtInitialized = false;
  public country: string;

  public dtOptions: DataTables.Settings = {
    autoWidth: false,
    jQueryUI: true,
    dom: '<"pull-left"f><"pull-right"l>tip',
    order: ['9']
  };
  public dtTrigger = new Subject();
  public userSubscription: Subscription;
  public model: Location = {} as Location;
  public patientModel: LocationPatient = {} as LocationPatient;
  public quarantinePersonModel: LocationQuarantine = {} as LocationQuarantine;

  public tableLocations: Location[] = [];
  public locations: Location[] = [];
  public rootLocations: Location[] = [];
  public rootLocationsCopy: Location[] = [];
  public dropdownLocations: Select2DropDown[] = [];
  public types: LocationTypes[] = LOCATION_TYPES;
  public genderTypes: GenderTypes[] = GENDER_TYPES;
  public currentUser: User = {} as User;

  constructor(
    private cdRef: ChangeDetectorRef,
    private spinnerService: SpinnerService,
    private router: Router,
    private locationService: LocationService,
    private authService: AuthenticationService) { }

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser.subscribe((response: any) => {
      if (response) {
        this.currentUser = response;
        this.quarantinePersonModel.quaratinedDate = new Date();
        this.getAllLocations();
      } else {
        this.currentUser = {} as User;
      }
    });
  }

  ngAfterViewInit() {
  }
  ngAfterViewChecked() {
    $('.dataTables_filter input, .dataTables_length select').addClass('form-control');
    this.cdRef.detectChanges();
  }

  ngOnDestroy(): void {
    if (this.dtTrigger) {
      this.dtTrigger.unsubscribe();
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  getAllLocations() {
    this.spinnerService.show();
    this.locationService.getAllLocationsDuplicate(environment.targetLocation).subscribe((response: Location) => {
      this.locations = [];
      this.tableLocations = [];
      this.dropdownLocations = [];

      if (response.type == 'Country') {
        this.country = response.placeName;
        response.country = response.placeName;
      }
      if (response) {

        const currentUserLocation: Location = Helpers.getPlaceLocations_Name(response, this.currentUser.placeName);
        const currentUserLocationList = this.restructureData(currentUserLocation);

        currentUserLocationList.forEach(item => {
          item.country = response.country;
        });

        this.locations = [...currentUserLocationList];
        this.tableLocations = [...currentUserLocationList];

        const locationsWithLevel = Helpers.getLocationWithLevel(currentUserLocation, 1, this.country);
        this.rootLocations = this.restructureData(locationsWithLevel);

        console.log(this.rootLocations);
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
    resCopy.level = 1;

    result.push(resCopy);

    if (Array.isArray(response.subordinates)) {
      result = result.concat(this.flatData(response.subordinates, response, response.country, (resCopy.level + 1)));
    }
    return result;
  }

  flatData(subordinates: Location[], root: Location, country: string, level: number) {
    let result: Location[] = [];

    const subor = [...subordinates];
    subor.forEach((sub) => {
      const subCopy = { ...sub };
      subCopy.root = root;
      subCopy.rootId = root.placeId;
      subCopy.country = country;
      subCopy.level = level;
      result.push(subCopy);
      if (Array.isArray(sub.subordinates)) {
        result = result.concat(this.flatData(sub.subordinates, sub, country, (subCopy.level + 1)));
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

  openAddPatient(data: Location) {
    this.patientModel = {} as LocationPatient;
    this.patientModel.placeId = data.placeId;
    this.patientModel.confirmed = true;
    this.patientModel.active = true;
    this.patientModel.placeName = data.placeName;
    this.patientModel.country = data.country;
    this.addPatientForm.resetForm({ ...this.patientModel });
    $('#addPatient').modal('toggle');
  }

  openQuarantinePerson(data: Location) {
    this.quarantinePersonModel = {} as LocationQuarantine;
    this.quarantinePersonModel.placeId = data.placeId;
    this.quarantinePersonModel.quarantined = true;
    this.quarantinePersonModel.placeName = data.placeName;
    this.quarantinePersonModel.quaratinedDate = new Date();
    this.quarantinePersonModel.country = data.country;
    this.addQuarantineForm.resetForm({ ...this.quarantinePersonModel });
    $('#addQuarantinePerson').modal('toggle');
  }

  openAssignedPatients(data: Location) {
    this.model = { ...data };
    this.router.navigate(['/location/' + this.model.placeId + '/patients']);
  }

  openAssignedPersons(data: Location) {
    this.model = { ...data };
    this.router.navigate(['/location/' + this.model.placeId + '/persons']);
  }

  openCreateLocation() {
    this.model = {} as Location;
    this.addForm.resetForm({ ...this.model });
    $('#addLocation').modal('toggle');

    $('#example_one').hierarchySelect({
      value: this.model.rootId,
      onChange: (value) => {
        this.model.rootId = value;
        console.log('[Three] value: "' + value + '"');
      }
    });

  }

  openEditLocation(data: Location) {
    this.model = { ...data };
    this.model.istarget = (this.model.root && this.model.root.placeName ? true : false);
    this.editForm.resetForm({ ...this.model });
    $('#editLocation').modal('toggle');
    $('#edit_example_one').hierarchySelect({
      value: this.model.rootId,
      onChange: (value) => {
        this.model.rootId = value;
        console.log('[Three] value: "' + value + '"');
      }
    });
  }

  openDeleteLocation(data: Location) {
    this.model = { ...data };
    $('#deleteLocation').modal('toggle');
  }


  addLocation(form: NgForm) {
    const model = { ...this.model };
    let rootName = '';
    if (model.rootId && model.istarget) {
      const root = this.rootLocations.find(x => x.placeId == model.rootId);
      if (root) {
        rootName = root.placeName;
      }
    }
    this.addForm.resetForm();

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

    this.addPatientForm.resetForm();

    this.locationService.createPatient(patientModel).subscribe((response: any) => {
    }).add(() => {
      $('#addPatient').modal('toggle');
      this.spinnerService.hide();
      this.getAllLocations();
    });
  }


  addQuarantinePerson(form: NgForm) {
    const quarantinedModel = { ...this.quarantinePersonModel };
    quarantinedModel.quaratinedDateStr = Helpers.convertDate(quarantinedModel.quaratinedDate);

    this.spinnerService.show();
    this.addQuarantineForm.resetForm();

    this.locationService.createQurarantine(quarantinedModel).subscribe((response: any) => {
    }).add(() => {
      $('#addQuarantinePerson').modal('toggle');
      this.spinnerService.hide();
      this.getAllLocations();
    });
  }

  calTrig() {
    $('#bsDatepickerAdd').click();
  }
}
