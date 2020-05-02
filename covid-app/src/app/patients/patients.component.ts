import { Component, OnInit, ViewChild, OnDestroy, AfterViewChecked } from '@angular/core';
import { Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { Subject, Subscription, forkJoin } from 'rxjs';

import * as Helpers from '../shared/helpers';
import { environment } from '../../environments/environment';
import { PatientService, SpinnerService, LocationService, AuthenticationService } from '../shared/services';
import { Patient, User } from '../shared/models';

declare var $;

@Component({
  selector: 'app-patients',
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.css']
})
export class PatientsComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild(DataTableDirective, { static: false }) dtElement: DataTableDirective;
  public isDtInitialized = false;

  public dtOptions: DataTables.Settings = {
    autoWidth: false,
    jQueryUI: true,
    dom: '<"pull-left"f><"pull-right"l>tip',
  };
  public dtTrigger = new Subject();

  public patients: Patient[] = [];
  public model: Patient;
  public currentUser: User = {} as User;
  public userSubscription: Subscription;

  constructor(
    private spinnerService: SpinnerService,
    private router: Router,
    private patientService: PatientService,
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
    const getAllPatients = this.patientService.getAllPatients();
    const getAllLocations = this.locationService.getAllLocationsDuplicate(environment.targetLocation);

    this.spinnerService.show();

    forkJoin([getAllLocations, getAllPatients]).subscribe(results => {
      const locationsResult = results[0];
      const patientsResult = results[1];
      let placeNames = [];

      if (locationsResult) {
        const currentUserLocations = Helpers.getPlaceLocations_Name_WithChild(locationsResult, this.currentUser.placeName);
        if (currentUserLocations) {
          placeNames = currentUserLocations.map(l => l.placeName);
        }
      }

      if (patientsResult && patientsResult.length > 0) {
        const patients = patientsResult.filter(item => {
          return placeNames.includes(item.city);
        });
        this.patients = patients;

        this.patients.forEach(element => {
          if (element.status === 'active') {
            element.rowColor = '#f39c12 ';
          } else if (element.status === 'recovered') {
            element.rowColor = '#00a65a';
          } else if (element.status === 'confirmed') {
            element.rowColor = '#dd4b39';
          } else if (element.status === 'deceased') {
            element.rowColor = '#0073b7';
          }
        });
      }
    }).add(() => {
      this.rerender();
      this.spinnerService.hide();
    });
  }

  // getAllPatients() {
  //   this.patients = [];
  //   this.spinnerService.show();
  //   this.patientService.getAllPatients().subscribe((response: Patient[]) => {
  //     if (response && response.length > 0) {
  //       this.patients = response;

  //       this.patients.forEach(element => {
  //         if (element.status === 'active') {
  //           element.rowColor = '#f39c12 ';
  //         } else if (element.status === 'recovered') {
  //           element.rowColor = '#00a65a';
  //         } else if (element.status === 'confirmed') {
  //           element.rowColor = '#dd4b39';
  //         } else if (element.status === 'deceased') {
  //           element.rowColor = '#0073b7';
  //         }
  //       });
  //     }
  //   }).add(() => {
  //     this.spinnerService.hide();
  //     this.rerender();
  //   });
  // }

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

  editPatient(patient: Patient) {
    this.router.navigate(['/editpatient/' + patient.patientId]);
  }
}
