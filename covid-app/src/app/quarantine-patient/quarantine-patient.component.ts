import { Component, OnInit, ViewChild, OnDestroy, AfterViewChecked } from '@angular/core';
import { Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { Subject, Subscription, forkJoin } from 'rxjs';

import * as Helpers from '../shared/helpers';
import { environment } from '../../environments/environment';
import { QuarantinedService, SpinnerService, LocationService, AuthenticationService } from '../shared/services';
import { QuarantinedPerson, User } from '../shared/models';

declare var $;

@Component({
  selector: 'app-quarantine-patient',
  templateUrl: './quarantine-patient.component.html',
  styleUrls: ['./quarantine-patient.component.css']
})
export class QuarantinePatientComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild(DataTableDirective, { static: false }) dtElement: DataTableDirective;
  public dtOptions: DataTables.Settings = {
    autoWidth: false,
    jQueryUI: true,
    dom: '<"pull-left"f><"pull-right"l>tip',
  };
  public dtTrigger = new Subject();
  public isDtInitialized = false;

  public persons: QuarantinedPerson[] = [];
  public currentUser: User = {} as User;
  public userSubscription: Subscription;

  constructor(
    private router: Router,
    private quarantinedService: QuarantinedService,
    private spinnerService: SpinnerService,
    private locationService: LocationService,
    private authService: AuthenticationService) { }

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser.subscribe((response: any) => {
      if (response) {
        this.currentUser = response;
        this.getAllAPIValues();
      } else {
        this.currentUser = {} as User;
      }
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

    this.spinnerService.show();

    forkJoin([getAllLocations, getAllPersons]).subscribe(results => {
      const locationsResult = results[0];
      const personsResult = results[1];
      let placeNames = [];

      if (locationsResult) {
        const currentUserLocations = Helpers.getPlaceLocations_Name_WithChild(locationsResult, this.currentUser.placeName);
        if (currentUserLocations) {
          placeNames = currentUserLocations.map(l => l.placeName);
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

  getAllPatients() {
    this.persons = [];
    this.spinnerService.show();
    this.quarantinedService.getAllQuarantinedPersons().subscribe((response: QuarantinedPerson[]) => {
      if (response && response.length > 0) {
        this.persons = response;
      }
    }).add(() => {
      this.spinnerService.hide();
      this.rerender();
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

  editQuarantinePatient(person: QuarantinedPerson) {
    this.router.navigate(['/editquarantineperson/' + person.patientId]);
  }
}
