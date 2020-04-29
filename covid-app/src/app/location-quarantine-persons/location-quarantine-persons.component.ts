import { Component, OnInit, ViewChild, OnDestroy, AfterViewChecked } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, forkJoin } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';

import * as Helpers from '../shared/helpers';
import { environment } from '../../environments/environment';
import { QuarantinedService, LocationService, SpinnerService } from '../shared/services';
import { QuarantinedPerson, Location } from '../shared/models';

declare var $;

@Component({
  selector: 'app-location-quarantine-persons',
  templateUrl: './location-quarantine-persons.component.html',
  styleUrls: ['./location-quarantine-persons.component.css']
})
export class LocationQuarantinePersonsComponent implements OnInit, AfterViewChecked, OnDestroy {
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
  public persons: QuarantinedPerson[] = [];
  public model: any = {};
  public cities: Location[] = [];

  constructor(
    private router: Router,
    private spinnerService: SpinnerService,
    private locationService: LocationService,
    private quarantinedService: QuarantinedService,
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
    const getAllPersons = this.quarantinedService.getAllQuarantinedPersons();
    const getAllLocations = this.locationService.getAllLocationsDuplicate(environment.targetLocation);

    this.cities = [];
    let locationModel = {} as Location;

    this.spinnerService.show();
    forkJoin([getAllLocations, getAllPersons]).subscribe(results => {
      debugger;
      const locationsResult = results[0];
      const personsResult = results[1];
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

      if (personsResult && personsResult.length > 0) {
        const persons = personsResult.filter(item => {
          return placeNames.includes(item.city);
        });
        this.persons = persons;
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

  public reAssignLocation(data: QuarantinedPerson) {
    this.model = { ...data };
    $('#reassignLocation').modal('toggle');
  }

  public openLocation() {
    this.router.navigate(['/location']);
  }

  assignLocation(form: NgForm) {
    if (form.valid) {
      this.spinnerService.show();
      this.quarantinedService.editReference(this.model).subscribe((response: QuarantinedPerson[]) => {
      }).add(() => {
        $('#reassignLocation').modal('toggle');
        this.spinnerService.hide();
        this.getAllAPIValues();
      });
    }
  }
}
