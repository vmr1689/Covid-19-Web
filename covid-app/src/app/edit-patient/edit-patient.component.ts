import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { SortEvent, NgbdSortableHeader, compare } from '../shared/directives/sortable.directive';

import { Patient } from '../shared/models';
import { PatientService } from '../shared/services';

declare var $;

@Component({
  selector: 'app-edit-patient',
  templateUrl: './edit-patient.component.html',
  styleUrls: ['./edit-patient.component.css']
})
export class EditPatientComponent implements OnInit {

  public form: FormGroup;
  public patientId: AbstractControl;
  public firstName: AbstractControl;
  public lastName: AbstractControl;
  public age: AbstractControl;
  public phone: AbstractControl;
  public email: AbstractControl;
  public address1: AbstractControl;
  public address2: AbstractControl;
  public address3: AbstractControl;
  public address4: AbstractControl;
  public address5: AbstractControl;
  public zipcode: AbstractControl;
  public latitude: AbstractControl;
  public longitude: AbstractControl;
  public deviceName: AbstractControl;
  public deviceAddress: AbstractControl;
  public placeId: AbstractControl;
  public severity: AbstractControl;
  public submitted: boolean;

  public locationModel: any = { placeId: '', severity: '', date: ''};
  public deviceModel: any = { deviceId: '', deviceName: '', deviceAddress: '', date: '', status: ''};

  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;

  locations: any[] = [
    { locationId: '1', latitude: '78.45512', longitude: '108.45512', place: 'Orissa', severity: 'high', date: '11/04/2020 18:20:24' },
    { locationId: '2', latitude: '80.45512', longitude: '100.45512', place: 'Kerala', severity: 'medium', date: '11/03/2020 18:20:24' },
    { locationId: '3', latitude: '80.45512', longitude: '100.45512', place: 'Delhi', severity: 'medium', date: '11/04/2020 18:20:24' }
  ];

  devices: any[] = [
    { deviceId: '1', deviceName: 'Device 1', deviceAddress: 'West Bengal', status: 'In-Active', date: '11/04/2020 18:20:24' },
    { deviceId: '2', deviceName: 'Device 2', deviceAddress: 'Tamil Nadu', status: 'In-Active', date: '11/03/2020 18:20:24' },
    { deviceId: '3', deviceName: 'Device 3', deviceAddress: 'Karnataka', status: 'Active', date: '11/04/2020 18:20:24' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private patientService: PatientService,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.initLoginForm();
  }

  public initLoginForm() {

    this.form = this.fb.group({
      patientId: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      age: ['', Validators.required],
      phone: ['', [Validators.required]],
      email: ['', [Validators.required]],
      address1: ['', [Validators.required]],
      address2: ['', Validators.required],
      address3: ['', [Validators.required]],
      address4: ['', [Validators.required]],
      address5: ['', Validators.required],
      zipcode: ['', [Validators.required]],
      latitude: ['', [Validators.required]],
      longitude: ['', [Validators.required]],
      deviceName: ['', [Validators.required]],
      deviceAddress: ['', [Validators.required]],
      placeId: ['', [Validators.required]],
      severity: ['', [Validators.required]],

    });
    this.patientId = this.form.controls.patientId;
    this.firstName = this.form.controls.firstName;
    this.lastName = this.form.controls.lastName;
    this.age = this.form.controls.age;
    this.phone = this.form.controls.phone;
    this.email = this.form.controls.email;

    this.address1 = this.form.controls.address1;
    this.address2 = this.form.controls.address2;
    this.address3 = this.form.controls.address3;
    this.address4 = this.form.controls.address4;
    this.address5 = this.form.controls.address5;

    this.zipcode = this.form.controls.zipcode;
    this.latitude = this.form.controls.latitude;
    this.longitude = this.form.controls.longitude;
    this.placeId = this.form.controls.placeId;
    this.severity = this.form.controls.severity;


    this.deviceName = this.form.controls.deviceName;
    this.deviceAddress = this.form.controls.deviceAddress;
  }
  public onSubmit(event: Event, form: any): void {
    event.stopPropagation();
    this.submitted = true;

    if (this.form.valid) {
      this.patientService.createPatient(null).subscribe((response: any) => {
        if (response) {
          this.navigateToLocation();
        }
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
  navigateToLocation() {
    this.router.navigate(['/patients']);
  }

  CreateLocationPopup($event) {
    this.locationModel =  { placeId: '', severity: '', date: ''};
    $('#addLocation').modal('toggle');
  }

  openEditLocationPopup($event, locationRow: any) {
    this.locationModel =  { placeId: '', severity: '', date: ''};
    $('#editLocation').modal('toggle');
  }

  openDeleteLocationPopup($event, locationRow: any) {
    this.locationModel =  { placeId: '', severity: '', date: ''};
    $('#deleteLocation').modal('toggle');
  }

  onLocationSort({ column, direction }: SortEvent) {

    // resetting other headers
    this.headers.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    // sorting countries
    const locations = [...this.locations];
    if (direction === '' || column === '') {
      this.locations = locations;
    } else {
      this.locations = [...locations].sort((a, b) => {
        const res = compare(`${a[column]}`, `${b[column]}`);
        return direction === 'asc' ? res : -res;
      });
    }
  }



  CreateDevicePopup(event) {
    event.preventDefault();
    this.deviceModel = { deviceId: '', deviceName: '', deviceAddress: '', date: '', status: ''};
    $('#addDevice').modal('toggle');
  }

  openEditDevicePopup(event, deviceRow: any) {
    event.preventDefault();
    this.deviceModel = { deviceId: '', deviceName: '', deviceAddress: '', date: '', status: ''};
    $('#editDevice').modal('toggle');
  }

  openDeleteDevicePopup(event, deviceRow: any) {
    this.deviceModel = { deviceId: '', deviceName: '', deviceAddress: '', date: '', status: ''};
    $('#deleteDevice').modal('toggle');
  }

  onDeviceSort({ column, direction }: SortEvent) {

    // resetting other headers
    this.headers.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    // sorting countries
    const devices = [...this.devices];
    if (direction === '' || column === '') {
      this.devices = devices;
    } else {
      this.devices = [...devices].sort((a, b) => {
        const res = compare(`${a[column]}`, `${b[column]}`);
        return direction === 'asc' ? res : -res;
      });
    }
  }

  addLocation(form: NgForm) {

  }

  editLocation(form: NgForm) {

  }

  deleteLocation(data: Location) {

  }

  addDevice(form: NgForm) {

  }

  editDevice(form: NgForm) {

  }

  deleteDevice(data: any) {

  }


}
