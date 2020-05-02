import { Component, OnInit, ViewChild, OnDestroy, AfterViewChecked } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, Subscription, forkJoin } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';

import * as Helpers from '../shared/helpers';
import { environment } from '../../environments/environment';
import { PatientService, LocationService, SpinnerService, AuthenticationService } from '../shared/services';
import { Patient, ngBootstrapTable, Location, User } from '../shared/models';

declare var $;

@Component({
  selector: 'app-location-patients',
  templateUrl: './location-patients.component.html',
  styleUrls: ['./location-patients.component.css']
})
export class LocationPatientsComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild(DataTableDirective, { static: false }) dtElement: DataTableDirective;
  public isDtInitialized = false;

  public dtOptions: DataTables.Settings = {
    autoWidth: false,
    jQueryUI: true,
    dom: '<"pull-left"f><"pull-right"l>tip',
  };
  public dtTrigger = new Subject();
  public locations: Location[] = [];
  public locationId: number;
  public location: Location = {} as Location;
  public patients: Patient[] = [];
  publiclocationTable: ngBootstrapTable;
  public model: any = {};
  public cities: Location[] = [];
  public currentUser: User = {} as User;
  public userSubscription: Subscription;

  constructor(
    private router: Router,
    private spinnerService: SpinnerService,
    private locationService: LocationService,
    private patientService: PatientService,
    private activatedRoute: ActivatedRoute,
    private authService: AuthenticationService) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      this.locationId = Number.parseInt(params.get('locationId'));

      this.userSubscription = this.authService.currentUser.subscribe((response: any) => {
        if (response) {
          this.currentUser = response;
          this.getAllAPIValues();
        } else {
          this.currentUser = {} as User;
        }
      });
    });
  }

  ngAfterViewChecked() {
    $('.dataTables_filter input, .dataTables_length select').addClass('form-control');
  }

  ngOnDestroy(): void {
    if (this.dtTrigger) {
      this.dtTrigger.unsubscribe();
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  public getAllAPIValues() {
    const getAllPatients = this.patientService.getAllPatients();
    const getAllLocations = this.locationService.getAllLocationsDuplicate(environment.targetLocation);

    this.cities = [];
    let locationModel = {} as Location;

    this.spinnerService.show();
    forkJoin([getAllLocations, getAllPatients]).subscribe(results => {
      const locationsResult = results[0];
      const patientsResult = results[1];
      let placeNames = [];

      if (locationsResult) {
        const locationsWithLevel = Helpers.getLocationWithLevel(locationsResult, 1, locationsResult.placeName);
        const cities = this.restructureData(locationsWithLevel);
        if (cities) {
          this.cities = cities;
        }
        const locations = Helpers.getPlaceLocations(locationsResult, this.locationId);
        if (locations) {
          this.locations = locations;

          locationModel = locations.find(p => p.placeId == this.locationId);
          this.location = locationModel;

          placeNames = this.locations.map(l => l.placeName);
        }
      }

      if (patientsResult && patientsResult.length > 0) {
        //const patients = patientsResult.filter(p => p.city == locationModel.placeName);
        const patients = patientsResult.filter(item => {
          return placeNames.includes(item.city);
        });
        this.patients = patients;
      }
    }).add(() => {
      this.rerender();
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

  public reAssignLocation(data: Patient) {
    this.model = { ...data };
    $('#reassignLocation').modal('toggle');
    $('#example_one').hierarchySelect({
      value: this.model.city,
      onChange: (value) => {
        this.model.city = value;
        console.log('[Three] value: "' + value + '"');
      }
    });
  }

  public openLocation() {
    this.router.navigate(['/location']);
  }

  assignLocation(form: NgForm) {
    if (form.valid) {
      this.spinnerService.show();
      this.patientService.editPatient(this.model).subscribe((response: Patient[]) => {
      }).add(() => {
        $('#reassignLocation').modal('toggle');
        this.spinnerService.hide();
        this.getAllAPIValues();
      });
    }
  }
}
