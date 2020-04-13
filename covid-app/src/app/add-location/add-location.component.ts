import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { Location } from '../shared/models';
import { LocationService } from '../shared/services';

@Component({
  selector: 'app-add-location',
  templateUrl: './add-location.component.html',
  styleUrls: ['./add-location.component.css']
})
export class AddLocationComponent implements OnInit {

  public form: FormGroup;
  public placeName: AbstractControl;
  public latitude: AbstractControl;
  public longitude: AbstractControl;
  public isTarget: AbstractControl;
  public rootId: AbstractControl;
  public submitted: boolean;
  public showRoot: boolean;
  public locations: Location[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private locationService: LocationService,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.getAllLocations();
    this.initLoginForm();
  }

  public initLoginForm() {
    this.form = this.fb.group({
      placeName: ['', [Validators.required]],
      latitude: ['', [Validators.required]],
      longitude: ['', Validators.required],
      rootId: ['', Validators.nullValidator],
      isTarget: [false]
    });

    this.placeName = this.form.controls.placeName;
    this.latitude = this.form.controls.latitude;
    this.longitude = this.form.controls.longitude;
    this.isTarget = this.form.controls.isTarget;
    this.rootId = this.form.controls.rootId;

    this.isTarget.valueChanges
      .subscribe(value => {
        if (value === true) {
          this.showRoot = true;
          this.rootId.setValidators([Validators.required]);
        } else {
          this.showRoot = false;
          this.rootId.setValidators(null);
          this.rootId.setValue('');
        }

        this.rootId.updateValueAndValidity();
      });

  }

  public getAllLocations() {
    this.locationService.getAllLocations().subscribe((response: any) => {
      this.locations = [];
      if (response && response.length > 0) {
        this.locations = response;
      }
    });
  }

  public onSubmit(event: Event, form: any): void {
    event.stopPropagation();
    this.submitted = true;

    if (this.form.valid) {
      const model: Location = {
        placeId: 0,
        placeName: form.placeName,
        latitude: form.latitude,
        longitude: form.latitude,
        istarget: form.istarget,
        rootId: form.parentId,
      };
      this.locationService.createLocation(model).subscribe((response: any) => {
        if (response) {
          this.navigateToLocation();
        }
      });

    }
  }

  navigateToLocation() {
    this.router.navigate(['/location']);
  }
}
