import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { Location } from '../shared/models';
import { LocationService } from '../shared/services';

@Component({
  selector: 'app-edit-location',
  templateUrl: './edit-location.component.html',
  styleUrls: ['./edit-location.component.css']
})
export class EditLocationComponent implements OnInit {

  public form: FormGroup;
  public placeName: AbstractControl;
  public latitude: AbstractControl;
  public longitude: AbstractControl;
  public isTarget: AbstractControl;
  public rootId: AbstractControl;
  public submitted: boolean;
  public showRoot: boolean;
  public locations: Location[] = [];
  public editableLocation: Location;
  public placeId: number;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private locationService: LocationService,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      debugger;
      this.placeId = Number.parseInt(params.get('placeId'));
      this.getLocationById();
      this.getAllLocations();
      this.initLoginForm();
    });
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

  public getLocationById() {
    this.locationService.getLocationById(this.placeId).subscribe((response: Location) => {
      this.locations = [];
      if (response) {
        this.editableLocation = response;

        this.placeName.setValue(this.editableLocation.placeName);
        this.latitude.setValue(this.editableLocation.latitude);
        this.longitude.setValue(this.editableLocation.longitude);
        this.isTarget.setValue(this.editableLocation.rootId);
        if (this.editableLocation.rootId) {
          this.showRoot = true;
          this.rootId.setValue(this.editableLocation.rootId);
        } else {
          this.showRoot = false;
        }
        
      }
    });
  }

  public getAllLocations() {
    this.locationService.getAllLocations().subscribe((response: Location[]) => {
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
