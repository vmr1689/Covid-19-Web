import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { SortEvent, NgbdSortableHeader, compare } from '../shared/directives/sortable.directive';

import { Patient } from '../shared/models';
import { PatientService } from '../shared/services';


declare var $;

@Component({
  selector: 'app-edit-quarantine-patient',
  templateUrl: './edit-quarantine-patient.component.html',
  styleUrls: ['./edit-quarantine-patient.component.css']
})
export class EditQuarantinePatientComponent implements OnInit {

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

  public referenceModel: any = {
    referenceId: '',
    patient: '',
    type: '',
    placeName: '',
    severity: '',
    date: ''
  };

  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;

  locations: any[] = [
    { placeId: '1', placeName: 'Pune'},
    { placeId: '2', placeName: 'New Delhi'},
    { placeId: '3', placeName: 'Puri'},
  ];

  Persons: any[] = [
    { id: '1', name: 'Test Patient 1'},
    { id: '2', name: 'Test Patient 2'}
  ];

  references: any[] = [
    { referenceId: '1', patient: 'Test Patient 1', status: 'Active', placeName: 'Pune', severity: 'high', date: '11/04/2020 18:20:24' },
    { referenceId: '2', patient: 'Test Patient 2', status: 'Confirmed', placeName: 'New Delhi', severity: 'Medium', date: '11/01/2020 18:20:24' },
    { referenceId: '3', patient: 'Test Patient 3', status: 'Deceased', placeName: 'Puri', severity: 'High', date: '11/15/2020 18:20:24' },
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
    this.router.navigate(['/quarantinepatients']);
  }

  CreateReferencePopup($event) {
    $event.preventDefault();
    this.referenceModel = { placeId: '', severity: '', date: '' };
    $('#addReference').modal('toggle');
  }

  openEditReferencePopup($event, locationRow: any) {
    $event.preventDefault();
    this.referenceModel = { placeId: '', severity: '', date: '' };
    $('#editReference').modal('toggle');
  }

  openDeleteReferencePopup($event, locationRow: any) {
    $event.preventDefault();
    this.referenceModel = { placeId: '', severity: '', date: '' };
    $('#deleteReference').modal('toggle');
  }

  onReferenceSort({ column, direction }: SortEvent) {

    // resetting other headers
    this.headers.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    // sorting countries
    const references = [...this.references];
    if (direction === '' || column === '') {
      this.references = references;
    } else {
      this.references = [...references].sort((a, b) => {
        const res = compare(`${a[column]}`, `${b[column]}`);
        return direction === 'asc' ? res : -res;
      });
    }
  }

  addReference(form: NgForm) {

  }

  editReference(form: NgForm) {

  }

  deleteReference(data: Location) {

  }
}
