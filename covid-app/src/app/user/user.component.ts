import { Component, OnInit, OnDestroy, QueryList, ViewChildren, AfterViewChecked, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, Observable, forkJoin } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';

import * as Helpers from '../shared/helpers';
import { LOCATION_TYPES } from '.././seedConfig';
import { environment } from '../../environments/environment';
import { UserService, LocationService, SpinnerService } from '../shared/services';
import { User, Location, LocationTypes } from '../shared/models';

declare var $;

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild(DataTableDirective, { static: false }) dtElement: DataTableDirective;
  public isDtInitialized = false;
  @ViewChild('addLocationForm') addLocationForm: NgForm;
  @ViewChild('addform') addForm: NgForm;
  @ViewChild('editForm') editForm: NgForm;
  public locations: Location[] = [];
  public rootLocations: Location[] = [];
  public types: LocationTypes[] = LOCATION_TYPES;

  public dtOptions: DataTables.Settings = {
    autoWidth: false,
    jQueryUI: true,
    dom: '<"pull-left"f><"pull-right"l>tip',
  };
  public dtTrigger = new Subject();

  public model: User = {} as User;
  public location: Location = {} as Location;

  public roles = [
    {
      id: 'SuperAdmin', value: 'Super Admin'
    },
    {
      id: 'Admin', value: 'Admin'
    },
  ];
  public users: User[] = [];

  constructor(
    private spinnerService: SpinnerService,
    private router: Router,
    private locationService: LocationService,
    private userService: UserService) { }

  ngOnInit(): void {
    this.getAllAPIValues();
  }

  ngAfterViewChecked() {
    $('.dataTables_filter input, .dataTables_length select').addClass('form-control');
  }

  ngOnDestroy(): void {
    if (this.dtTrigger) {
      this.dtTrigger.unsubscribe();
    }
  }

  getAllUsers() {
    this.spinnerService.show();
    this.userService.getAll().subscribe((response: User[]) => {
      this.users = [];
      if (response && response.length > 0) {
        this.users = response;
        this.rerender();
      }
    }).add(() => {
      this.spinnerService.hide();
    });
  }

  getAllLocations() {
    this.spinnerService.show();
    this.locationService.getAllLocationsDuplicate(environment.targetLocation).subscribe((response: Location) => {
      this.locations = [];

      if (response) {
        if (response.type == 'Country') {
          response.country = response.placeName;
        }
        const locationsWithLevel = Helpers.getLocationWithLevel(response, 1, response.placeName);
        const result = this.restructureData(locationsWithLevel);

        if (result) {
          this.locations = result;
          this.rootLocations = result;
        }
      }
    }).add(() => {
      this.spinnerService.hide();
    });
  }

  getAllAPIValues() {
    const getAllUsers = this.userService.getAll();
    const getAllLocations = this.locationService.getAllLocationsDuplicate(environment.targetLocation);

    this.spinnerService.show();
    forkJoin([getAllUsers, getAllLocations]).subscribe(results => {
      const usersResult = results[0];
      const locationsResult = results[1];

      if (usersResult && usersResult.length > 0) {
        this.users = usersResult;
      }

      if (locationsResult) {
        if (locationsResult.type == 'Country') {
          locationsResult.country = locationsResult.placeName;
        }
        const locationsWithLevel = Helpers.getLocationWithLevel(locationsResult, 1, locationsResult.placeName);
        const locations = this.restructureData(locationsWithLevel);
        if (locations) {
          this.locations = locations;
          this.rootLocations = locations;
        }
      }
    }).add(() => {
      this.rerender();
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

  openCreateUser() {
    this.model = {} as User;
    this.addForm.resetForm({ ...this.model });
    $('#addUser').modal('toggle');
    $('#example_one').hierarchySelect({
      value: this.model.placeId,
      onChange: (value) => {
        this.model.placeId = value;
        console.log('[Three] value: "' + value + '"');
      }
    });
  }

  openEditUser(data: User) {
    this.model = { ...data };
    this.editForm.resetForm({ ...this.model });
    $('#editUser').modal('toggle');
  }

  openDeleteUser(data: User) {
    this.model = { ...data };
    $('#deleteUser').modal('toggle');
  }

  addUser(form: NgForm) {
    this.spinnerService.show();
    const model = { ...this.model };
    if (form.valid) {
      this.userService.register(model).subscribe((response: any) => {
        $('#addUser').modal('toggle');
      }).add(() => {
        this.spinnerService.hide();
        this.getAllUsers();
      });
    }
   
  }

  editUser(form: NgForm) {
    this.spinnerService.show();
    this.userService.updateUser(this.model.id, this.model).subscribe((response: any) => {
      $('#editUser').modal('toggle');
    }).add(() => {
      this.spinnerService.hide();
      this.getAllUsers();
    });
  }

  deleteUser(data: User) {
    this.spinnerService.show();
    this.userService.delete(this.model.id).subscribe((response: any) => {
      $('#deleteUser').modal('toggle');
    }).add(() => {
      this.spinnerService.hide();
      this.getAllUsers();
    });
  }

  openCreateLocation() {
    this.location = {} as Location;
    this.addLocationForm.resetForm({ ...this.location });
    $('#addLocation').modal('toggle');
    $('#location_dropdown').hierarchySelect({
      value: this.location.rootId,
      onChange: (value) => {
        this.location.rootId = value;
        console.log('[Three] value: "' + value + '"');
      }
    });
  }

  addLocation(form: NgForm) {
    const model = { ...this.location };
    let rootName = '';
    if (model.rootId && model.istarget) {
      const root = this.rootLocations.find(x => x.placeId == model.rootId);
      if (root) {
        rootName = root.placeName;
      }
    }
    this.addForm.resetForm();

    this.spinnerService.show();
    this.locationService.createLocation(model, rootName).subscribe((response: any) => {
    }).add(() => {
      $('#addLocation').modal('toggle');
      this.spinnerService.hide();
      this.getAllLocations();
    });
  }

}


