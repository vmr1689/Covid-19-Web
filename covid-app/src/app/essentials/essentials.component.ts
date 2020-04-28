import { Component, OnInit, Input, Output, QueryList, ViewChildren, ViewChild, OnDestroy, AfterViewChecked } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';

import { SortEvent, NgbdSortableHeader, compare } from '../shared/directives/sortable.directive';

import { OrganisationService, SpinnerService } from '../shared/services';
import { Organisation, ngBootstrapTable } from '../shared/models';

@Component({
  selector: 'app-essentials',
  templateUrl: './essentials.component.html',
  styleUrls: ['./essentials.component.css']
})
export class EssentialsComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild(DataTableDirective, { static: false }) dtElement: DataTableDirective;
  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;
  @ViewChild('importForm') importForm: NgForm;
  @ViewChild('fileInput') fileInput;
  public importMessage: string;

  public dtOptions: DataTables.Settings = {
    autoWidth: false,
    jQueryUI: true,
    dom: '<"pull-left"f><"pull-right"l>tip',
    responsive: true
  };
  public dtTrigger = new Subject();
  public isDtInitialized = false;
  public model: Organisation = {} as Organisation;
  public organisations: Organisation[] = [];
  public organisationsCopy: Organisation[] = [];
  public states: any[] = [];
  public districts: any[] = [];
  public cities: any[] = [];
  public categories: any[] = [
    { categoryId: 0, category: 'All Categories' },
    { categoryId: 1, category: 'Hospital' },
    { categoryId: 2, category: 'CoVID-19 Testing Lab' },
  ];
  latitude = 20.5937;
  longitude = 78.9629;
  marlatitude = 20.5937;
  marongitude = 78.9629;
  mapType = 'satellite';
  viewMap = false;

  constructor(
    private spinnerService: SpinnerService,
    private router: Router,
    private organisationService: OrganisationService) { }

  ngOnInit(): void {
    this.getAllOrganisations();
  }

  ngAfterViewChecked() {
    $('.dataTables_filter input, .dataTables_length select').addClass('form-control');
  }

  ngOnDestroy(): void {
    if (this.dtTrigger) {
      this.dtTrigger.unsubscribe();
    }
  }

  getAllOrganisations() {
    this.spinnerService.show();
    this.organisationService.getAllOrganisations().subscribe((response: Organisation[]) => {
      this.organisations = [];
      if (response && response.length > 0) {
        this.organisations = response;
        this.organisationsCopy = response;
        this.rerender();
        this.initForm();
      }
    }).add(() => {
      this.spinnerService.hide();
    });
  }

  initForm() {
    if (this.organisations && this.organisations.length > 0) {
      const organisations = [...this.organisations];

      let states = organisations.map(o => o.state);
      const uniqueStates = new Set(states);
      states = [...uniqueStates];
      states.unshift('All States');

      // let districts = organisations.map(o => o.district);
      // const uniqueDistricts = new Set(districts);
      // districts = [...uniqueDistricts];
      // districts.unshift('All Districts');

      let cities = organisations.map(o => o.city);
      const uniqueCities = new Set(cities);
      cities = [...uniqueCities];
      cities.unshift('All Cities');

      this.states = states;
      //this.districts = districts;
      this.cities = cities;

      this.model.state = 'All States';
      //this.model.district = 'All Districts';
      this.model.city = 'All Cities';
      this.model.categoryId = 0;
    }
  }

  rerender(): void {
    if (this.isDtInitialized) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
        this.dtTrigger.next();
      });
    } else {
      this.isDtInitialized = true;
      this.dtTrigger.next();
    }
  }

  ResetSearchOrganisation() {
    this.model = {} as Organisation;
    this.organisations = [...this.organisationsCopy];
    this.model.state = 'All States';
    //this.model.district = 'All Districts';
    this.model.city = 'All Cities';
    this.model.categoryId = 0;

    this.searchOrganisation();
  }

  searchOrganisation() {
    debugger;
    let selectedState = this.model.state;
    //let selectedDistrict = this.model.district;
    let selectedCity = this.model.city;
    let selectedCategoryId = this.model.categoryId;

    let includeState = true;
    let includeDistrict = true;
    let includeCity = true;
    let includeCategory = true;

    if (selectedState == 'All States') {
      includeState = false;
    }
    // if (selectedDistrict == 'All Districts') {
    //   includeDistrict = false;
    // }
    if (selectedCity == 'All Cities') {
      includeCity = false;
    }
    if (selectedCategoryId == 0) {
      includeCategory = false;
    }

    const result = this.organisationsCopy.filter(x => {
      if (includeState && selectedState != x.state) {
        return false;
      }
      // if (includeDistrict && selectedDistrict != x.district) {
      //   return false;
      // }
      if (includeCity && selectedCity != x.city) {
        return false;
      }
      if (includeCategory && selectedCategoryId != x.categoryId) {
        return false;
      }
      return true;
    });

    this.organisations = result;
    this.rerender();
  }

  closeMap() {
    this.viewMap = false;
  }
  openMapOrganisation(data) {
    this.viewMap = true;

    this.latitude = Number(data.latitude);
    this.longitude = Number(data.longitude);
    this.marlatitude = Number(data.latitude);
    this.marongitude = Number(data.longitude);
  }
}
