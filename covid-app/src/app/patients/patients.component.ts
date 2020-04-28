import { Component, OnInit, ViewChild, OnDestroy, AfterViewChecked } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';

import { PatientService, SpinnerService } from '../shared/services';
import { Patient } from '../shared/models';

declare var $;

@Component({
  selector: 'app-patients',
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.css']
})
export class PatientsComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild(DataTableDirective, { static: false }) dtElement : DataTableDirective;
  public isDtInitialized = false;

  public dtOptions: DataTables.Settings = {
    autoWidth: false,
    jQueryUI: true,
    dom: '<"pull-left"f><"pull-right"l>tip',
  };
  public dtTrigger = new Subject();

  public patients: Patient[] = [];
  public model: Patient;

  constructor(
    private spinnerService: SpinnerService,
    private router: Router,
    private patientService: PatientService) { }

  ngOnInit(): void {
    this.getAllPatients();
  }

  ngAfterViewChecked() {
    $('.dataTables_filter input, .dataTables_length select').addClass('form-control');
  }

  ngOnDestroy(): void {
    if (this.dtTrigger) {
      this.dtTrigger.unsubscribe();
    }
  }

  getAllPatients() {
    this.patients = [];
    this.spinnerService.show();
    this.patientService.getAllPatients().subscribe((response: Patient[]) => {
      if (response && response.length > 0) {
        this.patients = response;

        this.patients.forEach(element => {
          if (element.status === 'active') {
            element.rowColor = '#f39c12 ';
          } else if (element.status === 'recovered') {
            element.rowColor = '#00a65a';
          } else if (element.status === 'confirmed') {
            element.rowColor = '#dd4b39';
          } else if (element.status === 'deceased') {
            element.rowColor = '#0073b7';
          }
        });
      }
    }).add(() => {
      this.spinnerService.hide();
      this.rerender();
    });
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

  editPatient(patient: Patient) {
    this.router.navigate(['/editpatient/' + patient.patientId]);
  }
}
