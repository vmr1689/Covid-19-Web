import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { Patient } from '../shared/models';
import { PatientService } from '../shared/services';

declare var $;

@Component({
  selector: 'app-add-patient',
  templateUrl: './add-patient.component.html',
  styleUrls: ['./add-patient.component.css']
})
export class AddPatientComponent implements OnInit {

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
  public submitted: boolean;
  
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
    var previous_tab = $('.nav-tabs > .active').prev('li').find('a');
    if (previous_tab.length > 0) {
        previous_tab.trigger('click');
    } else {
        $('.nav-tabs li:eq(0) a').trigger('click');
    }
}
  navigateToLocation() {
    this.router.navigate(['/patients']);
  }
}
