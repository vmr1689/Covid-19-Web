import { Component, OnInit, ViewChild, OnDestroy, AfterViewChecked } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';

import { environment } from '../../environments/environment';
import { ORGANISATION_TYPES } from '.././seedConfig';
import { OrganisationService, SpinnerService } from '../shared/services';
import { Organisation, OrganisationTypes } from '../shared/models';

@Component({
  selector: 'app-essentials',
  templateUrl: './essentials.component.html',
  styleUrls: ['./essentials.component.css']
})
export class EssentialsComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild(DataTableDirective, { static: false }) dtElement: DataTableDirective;
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

  public categories: OrganisationTypes[] = ORGANISATION_TYPES;
  public allCategories: OrganisationTypes = { id: '', text: 'All Categories' };

  latitude = 20.5937;
  longitude = 78.9629;
  marlatitude = 20.5937;
  marongitude = 78.9629;
  mapType = 'satellite';
  viewMap = false;

  constructor(
    private spinnerService: SpinnerService,
    private organisationService: OrganisationService) { }

  ngOnInit(): void {
    this.categories = [this.allCategories].concat(this.categories);
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

      let cities = organisations.map(o => o.city);
      const uniqueCities = new Set(cities);
      cities = [...uniqueCities];
      cities.unshift('All Cities');

      this.states = states;
      this.cities = cities;

      this.model.state = 'All States';
      this.model.city = 'All Cities';
      this.model.categoryId = '';
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
    this.model.city = 'All Cities';
    this.model.categoryId = '';

    this.searchOrganisation();
  }

  searchOrganisation() {
    const selectedState = this.model.state;
    const selectedCity = this.model.city;
    const selectedCategoryId = this.model.categoryId;

    let includeState = true;
    let includeCity = true;
    let includeCategory = true;

    if (selectedState == 'All States') {
      includeState = false;
    }
    if (selectedCity == 'All Cities') {
      includeCity = false;
    }
    if (selectedCategoryId == '') {
      includeCategory = false;
    }

    const result = this.organisationsCopy.filter(x => {
      if (includeState && selectedState != x.state) {
        return false;
      }
      if (includeCity && selectedCity != x.city) {
        return false;
      }
      if (includeCategory && selectedCategoryId != x.category) {
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
    if (data.latitude && data.longitude) {
      const url = environment.googleMapUrl + Number(data.latitude) + ',' + Number(data.longitude);
      window.open(url, '_blank');
    }
  }
}
