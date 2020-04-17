import { Component, OnInit, QueryList, ViewChildren, ViewChild , OnDestroy, AfterViewChecked } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';

import { SortEvent, NgbdSortableHeader, compare } from '../shared/directives/sortable.directive';

import { PatientService, LocationService } from '../shared/services';
import { Patient, ngBootstrapTable, Location } from '../shared/models';

declare var $;

@Component({
  selector: 'app-location-patients',
  templateUrl: './location-patients.component.html',
  styleUrls: ['./location-patients.component.css']
})
export class LocationPatientsComponent implements OnInit, AfterViewChecked, OnDestroy {
  public dtOptions: DataTables.Settings = {
    autoWidth: false,
    jQueryUI: true,
    dom: '<"pull-left"f><"pull-right"l>tip',
  };
  public dtTrigger = new Subject();
  public locations: Location[] = [];
  public locationId: number;
  public location: Location = {} as Location;
  public patients: Patient[] = [];
  publiclocationTable: ngBootstrapTable;
  public model: any = {};

  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private locationService: LocationService,
    private patientService: PatientService,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      this.locationId = Number.parseInt(params.get('locationId'));
      this.getAllPatients();
      this.getAllLocations();
    });
  }

  ngAfterViewChecked() {
    $('.dataTables_filter input, .dataTables_length select').addClass('form-control');
  }

  ngOnDestroy(): void {
    if (this.dtTrigger) {
      this.dtTrigger.unsubscribe();
    }
  }

  getAllLocations() {
    this.locationService.getAllLocations().subscribe((response: Location[]) => {
      this.locations = [];
      if (response && response.length > 0) {
        this.locations = response;
        this.location = response.find(x => x.placeId === this.locationId);
      }
    });
  }

  getAllPatients() {
    this.patientService.getAllPatients().subscribe((response: Patient[]) => {
      this.patients = [];
      if (response && response.length > 0) {
        this.patients = response;
        this.dtTrigger.next();
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

  public reAssignLocation(data: Patient) {
    this.model = {...data};
    $('#reassignLocation').modal('toggle');
  }

  public openLocation() {
    this.router.navigate(['/location']);
  }

  assignLocation(form: NgForm) {
  }

}
