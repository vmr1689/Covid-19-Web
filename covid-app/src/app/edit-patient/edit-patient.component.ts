import { Component, OnInit, ViewChild, AfterViewChecked, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { Subject, Observable, forkJoin } from 'rxjs';

import * as Helpers from '../shared/helpers';
import { STATUS_TYPES, GENDER_TYPES } from '.././seedConfig';
import { environment } from '../../environments/environment';
import { Patient, Location, GenderTypes, PatientDeviceInfo, PatientLocationInfo } from '../shared/models';
import { PatientService, LocationService, SpinnerService } from '../shared/services';

declare var $;

@Component({
  selector: 'app-edit-patient',
  templateUrl: './edit-patient.component.html',
  styleUrls: ['./edit-patient.component.css']
})
export class EditPatientComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild(DataTableDirective, { static: false }) dtElement: DataTableDirective;
  public isDtInitialized = false;

  public dtOptions: DataTables.Settings = {
    autoWidth: false,
    jQueryUI: true,
    dom: '<"pull-left"f><"pull-right"l>tip',
  };
  public dtTrigger = new Subject();

  public model: Patient = {} as Patient;
  public status: string;
  public submitted: boolean;
  public isReadOnly = true;
  public genderTypes: GenderTypes[] = GENDER_TYPES;

  public form: FormGroup;

  public patientId: AbstractControl;
  public firstName: AbstractControl;
  public lastName: AbstractControl;
  public email: AbstractControl;
  public phoneNumber: AbstractControl;
  public gender: AbstractControl;
  public city: AbstractControl;
  public age: AbstractControl;
  public address: AbstractControl;
  public confirmed: AbstractControl;
  public active: AbstractControl;
  public recovered: AbstractControl;
  public deceased: AbstractControl;
  public statusUpdatedDate: AbstractControl;
  public cities: Location[] = [];

  locations: PatientLocationInfo[] = [];
  devices: PatientDeviceInfo[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private patientService: PatientService,
    private locationService: LocationService,
    private activatedRoute: ActivatedRoute,
    private spinnerService: SpinnerService
  ) { }

  ngOnInit(): void {
    this.initLoginForm();
    this.activatedRoute.paramMap.subscribe(params => {
      const patientId = Number.parseInt(params.get('patientId'));
      this.model.patientId = patientId;
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

  public initLoginForm() {

    this.form = this.fb.group({
      patientId: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      city: ['', [Validators.required]],
      age: ['', Validators.required],
      address: ['', [Validators.required]],
      confirmed: [true, Validators.requiredTrue],
      active: [true],
      recovered: [],
      deceased: [],
      statusUpdatedDate: [new Date(), [Validators.required]],
    });
    this.patientId = this.form.controls.patientId;
    this.firstName = this.form.controls.firstName;
    this.lastName = this.form.controls.lastName;
    this.email = this.form.controls.email;
    this.phoneNumber = this.form.controls.phoneNumber;
    this.gender = this.form.controls.gender;
    this.city = this.form.controls.city;
    this.age = this.form.controls.age;
    this.address = this.form.controls.address;
    this.confirmed = this.form.controls.confirmed;
    this.active = this.form.controls.active;
    this.recovered = this.form.controls.recovered;
    this.deceased = this.form.controls.deceased;
    this.statusUpdatedDate = this.form.controls.statusUpdatedDate;

    this.form.disable();

  }

  setData() {
    const model = { ...this.model };

    this.patientId.setValue(model.patientId);
    this.firstName.setValue(model.firstName);
    this.lastName.setValue(model.lastName);
    this.email.setValue(model.email);
    this.phoneNumber.setValue(model.phoneNumber);
    this.gender.setValue(model.gender);
    this.city.setValue(model.city);
    this.age.setValue(model.age);
    this.address.setValue(model.address);

    if (model.status == STATUS_TYPES[2].id) { // active
      this.active.setValue(true);
      this.recovered.setValue(false);
      this.deceased.setValue(false);
    } else if (model.status == STATUS_TYPES[3].id) { // recovered
      this.active.setValue(false);
      this.recovered.setValue(true);
      this.deceased.setValue(false);
    } else if (model.status == STATUS_TYPES[4].id) { // deceased
      this.active.setValue(false);
      this.recovered.setValue(false);
      this.deceased.setValue(true);
    }

    if (model.statusUpdatedDate) {
      const statusUpdatedDate = Helpers.getDateFromTimeStamp(model.statusUpdatedDate);
      this.statusUpdatedDate.setValue(statusUpdatedDate);
    }

    this.status = model.status;
  }

  public getAllAPIValues() {
    const getAllPatients = this.patientService.getAllPatients();
    const getAllLocations = this.locationService.getAllLocationsDuplicate(environment.targetLocation);

    this.cities = [];
    let patientModel = {} as Patient;

    this.spinnerService.show();
    forkJoin([getAllPatients, getAllLocations]).subscribe(results => {
      const patientsResult = results[0];
      const locationsResult = results[1];

      if (patientsResult && patientsResult.length > 0) {
        patientModel = patientsResult.find(p => p.patientId == this.model.patientId);
      }

      if (locationsResult) {
        this.cities = Helpers.restructureData(locationsResult);
      }
      if (patientModel) {
        this.model = patientModel;
        this.setData();
      }
    }).add(() => {
      this.getAllLocationDeviceValues();
      this.spinnerService.hide();
    });
  }

  public getAllLocationDeviceValues() {
    const phone = this.model.phoneNumber;
    if (phone) {
      const getAllLocationInfo = this.patientService.getLocationInfo(phone);
      const getAllDeviceInfos = this.patientService.getDeviceInfo(phone);

      this.spinnerService.show();

      forkJoin([getAllLocationInfo, getAllDeviceInfos]).subscribe(results => {
        const locationsResult = results[0];
        const devicesResult = results[1];

        if (locationsResult && locationsResult.length > 0) {
          this.locations = locationsResult;
        }

        if (devicesResult && devicesResult.length > 0) {
          this.devices = devicesResult;
        }
      }).add(() => {
        this.spinnerService.hide();
        this.rerender();
      });
    }
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

  public onSubmit(event: Event, form: any): void {
    event.stopPropagation();
    this.submitted = true;

    if (this.form.valid) {
      const request: Patient = {
        patientId: this.patientId.value,
        firstName: this.firstName.value,
        lastName: this.lastName.value,
        email: this.email.value,
        phoneNumber: this.phoneNumber.value,
        gender: this.gender.value,
        city: this.city.value,
        state: '',
        country: '',
        id: this.patientId.value,
        age: this.age.value,
        address: this.address.value,
        status: this.status
      };
      if (this.deceased.value) {
        request.status = STATUS_TYPES[4].id;
      }
      else if (this.recovered.value) {
        request.status = STATUS_TYPES[3].id;
      }
      else if (this.active.value) {
        request.status = STATUS_TYPES[2].id;
      }
      else {
        request.status = STATUS_TYPES[2].id;
      }
      console.log(request);
      this.spinnerService.show();
      this.patientService.editPatient(request).subscribe((response: any) => {
        if (response) {
          this.BackToList();
        }
      }).add(() => {
        this.spinnerService.hide();
      });
    }
  }

  editInfo() {
    this.isReadOnly = !this.isReadOnly;
    if (!this.isReadOnly) {
      this.form.enable();
    }
    else {
      this.form.disable();
    }
  }

  nextTab() {
    $('.nav-tabs > .active').next('li').find('a').trigger('click');
  }

  previousTab() {
    const previousTab = $('.nav-tabs > .active').prev('li').find('a');
    if (previousTab.length > 0) {
      previousTab.trigger('click');
    } else {
      $('.nav-tabs li:eq(0) a').trigger('click');
    }
  }

  BackToList() {
    this.router.navigate(['/patients']);
  }
}
