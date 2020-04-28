import { Component, OnInit, ViewChild, OnDestroy, AfterViewChecked } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, Observable, forkJoin } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';

import * as Helpers from '../shared/helpers';
import { environment } from '../../environments/environment';
import { PatientService, LocationService, SpinnerService } from '../shared/services';
import { Patient, ngBootstrapTable, Location } from '../shared/models';

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

  constructor(
    private router: Router,
    private spinnerService: SpinnerService,
    private locationService: LocationService,
    private patientService: PatientService,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      this.locationId = Number.parseInt(params.get('locationId'));
      this.getAllAPIValues();
    });
  }

  ngAfterViewChecked() {
    $('.dataTables_filter input, .dataTables_length select').addClass('form-control');
  }

  ngOnDestroy(): void {
    if (this.dtTrigger) {
      this.dtTrigger.unsubscribe();
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
        const cities = Helpers.restructureData(locationsResult);
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
        debugger;
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
