import { Component, OnInit, ViewChild, OnDestroy, AfterViewChecked } from '@angular/core';
import { Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';

import { QuarantinedService, SpinnerService } from '../shared/services';
import { QuarantinedPerson } from '../shared/models';
import { Subject } from 'rxjs';

declare var $;

@Component({
  selector: 'app-quarantine-patient',
  templateUrl: './quarantine-patient.component.html',
  styleUrls: ['./quarantine-patient.component.css']
})
export class QuarantinePatientComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild(DataTableDirective, { static: false }) dtElement: DataTableDirective;
  public dtOptions: DataTables.Settings = {
    autoWidth: false,
    jQueryUI: true,
    dom: '<"pull-left"f><"pull-right"l>tip',
  };
  public dtTrigger = new Subject();
  public isDtInitialized = false;

  public persons: QuarantinedPerson[] = [];

  constructor(
    private router: Router,
    private quarantinedService: QuarantinedService,
    private spinnerService: SpinnerService) { }

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
    this.persons = [];
    this.spinnerService.show();
    this.quarantinedService.getAllQuarantinedPersons().subscribe((response: QuarantinedPerson[]) => {
      if (response && response.length > 0) {
        this.persons = response;
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

  editQuarantinePatient(person: QuarantinedPerson) {
    this.router.navigate(['/editquarantineperson/' + person.quaratinedId]);
  }
}
