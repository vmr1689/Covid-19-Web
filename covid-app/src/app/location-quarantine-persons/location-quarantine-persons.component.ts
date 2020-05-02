import { Component, OnInit, ViewChild, OnDestroy, AfterViewChecked } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, Subscription, forkJoin } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';

import * as Helpers from '../shared/helpers';
import { environment } from '../../environments/environment';
import { QuarantinedService, LocationService, SpinnerService, AuthenticationService } from '../shared/services';
import { QuarantinedPerson, Location, User } from '../shared/models';

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
  public model: QuarantinedPerson = {} as QuarantinedPerson;
  public cities: Location[] = [];
  public currentUser: User = {} as User;
  public userSubscription: Subscription;

  constructor(
    private router: Router,
    private spinnerService: SpinnerService,
    private locationService: LocationService,
    private quarantinedService: QuarantinedService,
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
    const getAllPersons = this.quarantinedService.getAllQuarantinedPersons();
    const getAllLocations = this.locationService.getAllLocationsDuplicate(environment.targetLocation);

    this.cities = [];
    let locationModel = {} as Location;

    this.spinnerService.show();
    forkJoin([getAllLocations, getAllPersons]).subscribe(results => {
      const locationsResult = results[0];
      const personsResult = results[1];
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

  public reAssignLocation(data: QuarantinedPerson) {
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
    const model = { ...this.model };
    if (form.valid) {
      this.spinnerService.show();
      const quarantineDate = Helpers.getDateFromDateStr(model.quaratinedDate);
      model.quaratinedDateStr = Helpers.convertDate(quarantineDate);
      this.quarantinedService.editPerson(model).subscribe((response: QuarantinedPerson[]) => {
      }).add(() => {
        $('#reassignLocation').modal('toggle');
        this.spinnerService.hide();
        this.getAllAPIValues();
      });
    }
  }
}
