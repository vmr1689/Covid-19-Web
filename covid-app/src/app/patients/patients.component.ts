import { Component, OnInit, QueryList, ViewChildren, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { SortEvent, NgbdSortableHeader, compare } from '../shared/directives/sortable.directive';

import { PatientService } from '../shared/services';
import { Patient, ngBootstrapTable } from '../shared/models';

declare var $;

@Component({
  selector: 'app-patients',
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.css']
})
export class PatientsComponent implements OnInit {

  public patients: Patient[] = [];
  publiclocationTable: ngBootstrapTable;
  public model: Patient;

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

  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;
  @ViewChild('formDirective') private formDirective: NgForm;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private patientService: PatientService) { }

  ngOnInit(): void {
    this.initLoginForm();
    this.getAllPatients();
  }


  getAllPatients() {
    this.patientService.getAllPatients().subscribe((response: Patient[]) => {
      this.patients = [];
      if (response && response.length > 0) {
        this.patients = response;
      }
    });
  }

  onSort({ column, direction }: SortEvent) {

    // resetting other headers
    this.headers.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    // sorting countries
    const patients = [...this.patients];
    if (direction === '' || column === '') {
      this.patients = patients;
    } else {
      this.patients = [...patients].sort((a, b) => {
        const res = compare(`${a[column]}`, `${b[column]}`);
        return direction === 'asc' ? res : -res;
      });
    }
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

  openCreatePatient() {
    this.router.navigate(['/addpatient']);
  }

  editPatient(patient: Patient) {
    this.router.navigate(['/addpatient/' + patient.placeId]);
  }

  public onSubmit(event: Event, form: any): void {
    debugger;
    event.stopPropagation();
    this.submitted = true;

    if (this.form.valid) {


    }
  }
}
