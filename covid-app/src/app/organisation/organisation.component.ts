import { Component, OnInit, ViewChild, OnDestroy, AfterViewChecked } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';

import { OrganisationService, SpinnerService } from '../shared/services';
import { Organisation } from '../shared/models';

declare var $;

@Component({
  selector: 'app-organisation',
  templateUrl: './organisation.component.html',
  styleUrls: ['./organisation.component.css']
})
export class OrganisationComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild(DataTableDirective, { static: false }) dtElement: DataTableDirective;
  @ViewChild('importForm') importForm: NgForm;
  @ViewChild('fileInput') fileInput;
  public importMessage: string;

  public dtOptions: DataTables.Settings = {
    autoWidth: false,
    jQueryUI: true,
    dom: '<"pull-left"f><"pull-right"l>tip',
  };
  public dtTrigger = new Subject();
  public isDtInitialized = false;
  public model: Organisation = {} as Organisation;
  public organisations: Organisation[] = [];

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
    this.organisations = [];
    this.organisationService.getAllOrganisations().subscribe((response: Organisation[]) => {
      if (response && response.length > 0) {
        this.organisations = response;
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
        }, 5000);
      });
    } else {
      this.isDtInitialized = true;
      this.dtTrigger.next();
    }
  }

  openCreateOrganisation() {
    this.router.navigate(['/addorganisation']);
  }

  openEditOrganisation(data: Organisation) {
    this.router.navigate(['/editorganisation/' + data.covidOrganizationId]);
  }

  openDeleteOrganisation(data: Organisation) {
    this.model = { ...data };
    $('#deleteOrganisation').modal('toggle');
  }

  openImportOrganisation() {
    this.importForm.reset();
    this.fileInput.nativeElement.value = '';
    $('#importOrganisation').modal('toggle');
  }

  deleteOrganisation(data: Organisation) {
    this.spinnerService.show();
    this.organisationService.delete(data.covidOrganizationId).subscribe((response: any) => {
      $('#deleteOrganisation').modal('toggle');
    }).add(() => {
      this.spinnerService.hide();
    });
  }

  importOrganisation(form: NgForm) {

    if (this.fileInput && this.fileInput.nativeElement.files.length > 0) {
      const formData = new FormData();
      formData.append('file', this.fileInput.nativeElement.files[0]);

      this.spinnerService.show();
      this.organisationService.importExcel(formData).subscribe(result => {
        this.importMessage = result.toString();
      }).add(() => {
        $('#importOrganisation').modal('toggle');
        this.spinnerService.hide();
        window.location.reload();
      });
    }
  }
}
