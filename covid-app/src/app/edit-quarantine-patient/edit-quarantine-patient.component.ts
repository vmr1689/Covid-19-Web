import { Component, OnInit, QueryList, ViewChildren, OnDestroy, AfterViewChecked } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';

import { SortEvent, NgbdSortableHeader, compare } from '../shared/directives/sortable.directive';

import { Patient } from '../shared/models';
import { PatientService } from '../shared/services';



declare var $;

@Component({
  selector: 'app-edit-quarantine-patient',
  templateUrl: './edit-quarantine-patient.component.html',
  styleUrls: ['./edit-quarantine-patient.component.css']
})
export class EditQuarantinePatientComponent implements OnInit, AfterViewChecked, OnDestroy {
  public dtOptions: DataTables.Settings = {
    autoWidth: false,
    jQueryUI: true,
    dom: '<"pull-left"f><"pull-right"l>tip',
  };
  public dtTrigger = new Subject();

  public form: FormGroup;
  public patientId: AbstractControl;
  public firstName: AbstractControl;
  public lastName: AbstractControl;
  public age: AbstractControl;
  public gender: AbstractControl;
  public phone: AbstractControl;
  public email: AbstractControl;
  public address1: AbstractControl;
  public zipcode: AbstractControl;
  public latitude: AbstractControl;
  public longitude: AbstractControl;
  public deviceName: AbstractControl;
  public deviceAddress: AbstractControl;
  public placeId: AbstractControl;
  public severity: AbstractControl;
  public submitted: boolean;
  public quarantined: AbstractControl;
  public confirmed: AbstractControl;
  public active: AbstractControl;
  public recovered: AbstractControl;
  public deceased: AbstractControl;
  public released: AbstractControl;
  public isReadOnly = true;

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

  references: any[] = [
    { referenceId: '1', patient: 'Gajendra Panchal', status: 'Active', placeName: 'Coimbatore', severity: 'high', date: '11/04/2020 06:10:24' },
    { referenceId: '2', patient: 'Umesh Pandya', status: 'Confirmed', placeName: 'New Delhi', severity: 'Medium', date: '11/03/2020 12:20:24' },
    { referenceId: '3', patient: 'Supriya Hayer', status: 'Deceased', placeName: 'Puri', severity: 'High', date: '03/11/2019 18:20:24' },
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

  ngAfterViewChecked() {
    $('.dataTables_filter input, .dataTables_length select').addClass('form-control');
  }

  ngOnDestroy(): void {
    if (this.dtTrigger) {
      this.dtTrigger.unsubscribe();
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

  public initLoginForm() {

    this.form = this.fb.group({
      patientId: ['41', [Validators.required]],
      firstName: ['Iqbal', [Validators.required]],
      lastName: ['Thomas', [Validators.required]],
      age: ['30', Validators.required],
      phone: ['9874563210', [Validators.required]],
      email: ['Thomas121@gmail.com', [Validators.required]],
      address1: ['84 DB 67, ST Street, West Delhi', [Validators.required]],
      zipcode: ['613545', [Validators.required]],
      latitude: ['', [Validators.required]],
      longitude: ['', [Validators.required]],
      deviceName: ['', [Validators.required]],
      deviceAddress: ['', [Validators.required]],
      placeId: ['', [Validators.required]],
      severity: ['', [Validators.required]],
      quarantined: [true],
      confirmed: [false],
      active: [false],
      recovered: [false],
      deceased: [false],
      released: [false],
      gender: ['male']
    });
    this.patientId = this.form.controls.patientId;
    this.firstName = this.form.controls.firstName;
    this.lastName = this.form.controls.lastName;
    this.age = this.form.controls.age;
    this.phone = this.form.controls.phone;
    this.email = this.form.controls.email;
    this.gender = this.form.controls.gender;
    this.address1 = this.form.controls.address1;

    this.zipcode = this.form.controls.zipcode;
    this.latitude = this.form.controls.latitude;
    this.longitude = this.form.controls.longitude;
    this.placeId = this.form.controls.placeId;
    this.severity = this.form.controls.severity;

    this.quarantined = this.form.controls.quarantined;
    this.confirmed = this.form.controls.confirmed;
    this.active = this.form.controls.active;
    this.recovered = this.form.controls.recovered;
    this.deceased = this.form.controls.deceased;
    this.released = this.form.controls.released;

    this.deviceName = this.form.controls.deviceName;
    this.deviceAddress = this.form.controls.deviceAddress;
    this.form.disable();
  }
  public onSubmit(event: Event, form: any): void {
    event.stopPropagation();
    this.submitted = true;

    if (this.form.valid) {
      this.patientService.createPatient(null).subscribe((response: any) => {
        if (response) {
          this.BackToList();
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
  BackToList() {
    this.router.navigate(['/quarantinepersons']);
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
