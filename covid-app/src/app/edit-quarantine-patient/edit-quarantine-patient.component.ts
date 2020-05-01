import { Component, OnInit, ViewChild, OnDestroy, AfterViewChecked } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';

import * as Helpers from '../shared/helpers';
import { STATUS_TYPES, GENDER_TYPES } from '.././seedConfig';
import { environment } from '../../environments/environment';

import { QuarantinedPerson, Location, GenderTypes, QuarantinedReference, Patient } from '../shared/models';
import { QuarantinedService, LocationService, SpinnerService } from '../shared/services';
import { Subject, Observable, forkJoin } from 'rxjs';


declare var $;

@Component({
  selector: 'app-edit-quarantine-patient',
  templateUrl: './edit-quarantine-patient.component.html',
  styleUrls: ['./edit-quarantine-patient.component.css']
})
export class EditQuarantinePatientComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild(DataTableDirective, { static: false }) dtElement: DataTableDirective;
  public isDtInitialized = false;

  public dtOptions: DataTables.Settings = {
    autoWidth: false,
    jQueryUI: true,
    dom: '<"pull-left"f><"pull-right"l>tip',
  };
  public dtTrigger = new Subject();

  public model: QuarantinedPerson = {} as QuarantinedPerson;
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
  public quarantined: AbstractControl;
  public confirmed: AbstractControl;
  public released: AbstractControl;
  public remainingDays: AbstractControl;
  public quaratinedDate: AbstractControl;
  public cities: Location[] = [];
  public referenceLocations: Location[] = [];

  public referenceModel: QuarantinedReference = {} as QuarantinedReference;

  locations: any[] = [
    { placeId: '1', placeName: 'Pune' },
    { placeId: '2', placeName: 'New Delhi' },
    { placeId: '3', placeName: 'Puri' },
  ];

  Persons: any[] = [
    { id: '1', name: 'Gajendra Panchal' },
    { id: '2', name: 'Umesh Pandya' },
    { id: '3', name: 'Supriya Hayer' },
    { id: '4', name: 'Asatha Ganesh' },
    { id: '5', name: 'Kirti Date' }
  ];

  references: QuarantinedReference[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private quarantinedService: QuarantinedService,
    private locationService: LocationService,
    private spinnerService: SpinnerService,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      const patientId = Number.parseInt(params.get('patientId'));
      this.model.patientId = patientId;
      this.getAllAPIValues();
    });

    this.initLoginForm();
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
      remainingDays: ['', [Validators.required]],
      city: ['', [Validators.required]],
      age: ['', Validators.required],
      address: ['', [Validators.required]],
      quarantined: [true],
      confirmed: [false],
      released: [false],
      quaratinedDate: [new Date()],
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
    this.quarantined = this.form.controls.quarantined;
    this.confirmed = this.form.controls.confirmed;
    this.released = this.form.controls.released;
    this.quaratinedDate = this.form.controls.quaratinedDate;
    this.remainingDays = this.form.controls.remainingDays;

    this.form.disable();
  }

  public getAllAPIValues() {
    const getAllPersons = this.quarantinedService.getAllQuarantinedPersons();
    const getAllLocations = this.locationService.getAllLocationsDuplicate(environment.targetLocation);

    let personModel = {} as QuarantinedPerson;

    this.spinnerService.show();
    forkJoin([getAllPersons, getAllLocations]).subscribe(results => {

      const personResult = results[0];
      const locationsResult = results[1];

      if (personResult && personResult.length > 0) {
        personModel = personResult.find(p => p.patientId == this.model.patientId);
      }

      if (locationsResult) {
        const locationsWithLevel = Helpers.getLocationWithLevel(locationsResult, 1, locationsResult.placeName);
        const cities = this.restructureData(locationsWithLevel);

        if (cities) {
          this.cities = cities;
        }
      }

      if (personModel) {
        this.model = personModel;
        this.setData();
      }
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
    this.remainingDays.setValue(model.remainingDays);

    if (model.status == STATUS_TYPES[1].id) {
      this.quarantined.setValue(false);
      this.confirmed.setValue(true);
      this.released.setValue(false);
    } else if (model.status == STATUS_TYPES[5].id) { // released
      this.quarantined.setValue(false);
      this.confirmed.setValue(false);
      this.released.setValue(true);
    }

    this.status = model.status;
    const quarantineDate = Helpers.getDateFromDateStr(model.quaratinedDate);

    this.quaratinedDate.setValue(quarantineDate);

    
    setTimeout(() => {
      $('#example_one').hierarchySelect({
        value: this.model.city,
        onChange: (value) => {
          this.model.city = value;
          this.city.setValue(value);
          console.log('[Three] value: "' + value + '"');
        }
      });
    });
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

  public onSubmit(event: Event, form: any): void {
    event.stopPropagation();
    this.submitted = true;
    debugger;
    if (this.form.valid) {
      const request: QuarantinedPerson = {
        patientId: this.patientId.value,
        firstName: this.firstName.value,
        lastName: this.lastName.value,
        email: this.email.value,
        phoneNumber: this.phoneNumber.value,
        gender: this.gender.value,
        city: this.city.value,
        state: this.model.state,
        country: this.model.country,
        age: this.age.value,
        address: this.address.value,
        status: this.status,
        remainingDays: this.model.remainingDays,
        quaratinedDate: this.model.quaratinedDate,
        street: this.model.street,
        quaratinedDateStr: Helpers.convertDate(this.quaratinedDate.value),
        type: 'quarantined'
      };

      if (this.released.value) {
        request.status = STATUS_TYPES[5].id;
      }
      else if (this.confirmed.value) {
        request.status = STATUS_TYPES[1].id;
      }
      else {
        request.status = STATUS_TYPES[0].id;
      }
      request.type = (request.status == STATUS_TYPES[1].id) ? 'patient' : 'quarantined';
      console.log(request);
      this.spinnerService.show();
      this.quarantinedService.editPerson(request).subscribe((response: any) => {
        if (response) {
          this.BackToList();
        }
      }).add(() => {
        this.spinnerService.hide();
      });
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
    this.router.navigate(['/quarantinepersons']);
  }

  calTrig() {
    $('#bsDatepickerAdd').click();
  }

  calTrigDatepickerRef() {
    $('#bsDatepickerRefAdd').click();
  }

  CreateReferencePopup($event) {
    $event.preventDefault();
    this.referenceModel = {} as QuarantinedReference;
    this.referenceModel.date = new Date();
    $('#addReference').modal('toggle');
  }

  openEditReferencePopup($event, model: QuarantinedReference) {
    $event.preventDefault();
    this.referenceModel = { ...model };
    this.referenceModel.date = Helpers.getDateFromDateStr(this.referenceModel.dateStr);
    $('#editReference').modal('toggle');
  }

  openDeleteReferencePopup($event, model: QuarantinedReference) {
    $event.preventDefault();
    this.referenceModel = { ...model };
    this.referenceModel.date = Helpers.getDateFromDateStr(this.referenceModel.dateStr);
    $('#deleteReference').modal('toggle');
  }

  addReference(form: NgForm) {
    const referenceModel = { ...this.referenceModel };
    this.spinnerService.show();

    this.quarantinedService.addReference(referenceModel).subscribe((response: any) => {
    }).add(() => {
      $('#addReference').modal('toggle');
      this.spinnerService.hide();
    });
  }

  editReference(form: NgForm) {
    const referenceModel = { ...this.referenceModel };
    this.spinnerService.show();

    this.quarantinedService.editReference(referenceModel).subscribe((response: any) => {
    }).add(() => {
      $('#editReference').modal('toggle');
      this.spinnerService.hide();
    });
  }

  deleteReference(data: QuarantinedReference) {
    this.spinnerService.show();

    this.quarantinedService.deleteReference(data.referenceId).subscribe((response: any) => {
      $('#deleteReference').modal('toggle');
    }).add(() => {
      this.spinnerService.hide();
    });
  }
}
