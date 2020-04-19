import { Component, OnInit, QueryList, ViewChildren, ViewChild, OnDestroy, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';

import { NgbdSortableHeader} from '../shared/directives/sortable.directive';

import { GuidelinesService, SpinnerService } from '../shared/services';
import { Guidelines, ngBootstrapTable } from '../shared/models';

declare var $;

@Component({
  selector: 'app-guidelines',
  templateUrl: './guidelines.component.html',
  styleUrls: ['./guidelines.component.css']
})
export class GuidelinesComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild(DataTableDirective, { static: false }) dtElement: DataTableDirective;
  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;
  @ViewChild('fileInput') fileInput;
  @ViewChild('importForm') importForm: NgForm;
  @ViewChild('editfileInput') editfileInput;
  @ViewChild('addForm') addForm: NgForm;
  public dtOptions: DataTables.Settings = {
    autoWidth: false,
    jQueryUI: true,
    dom: '<"pull-left"f><"pull-right"l>tip',
  };
  public dtTrigger = new Subject();
  public isDtInitialized = false;
  public model: Guidelines = {} as Guidelines;
  public guidelines: Guidelines[] = [];
  public categories: any[] = [
    { id: 1, text: 'Link' },
    { id: 2, text: 'Content' },
  ];
  public defaultCategory = 1;
  public submitted = false;
  public importMessage: string;

  constructor(
    private spinnerService: SpinnerService,
    private router: Router,
    private guidelinesService: GuidelinesService) { }

  ngOnInit(): void {
    this.getAllGuidelines();
  }

  ngAfterViewChecked() {
    $('.dataTables_filter input, .dataTables_length select').addClass('form-control');
  }

  ngOnDestroy(): void {
    if (this.dtTrigger) {
      this.dtTrigger.unsubscribe();
    }
  }

  getAllGuidelines() {
    this.spinnerService.show();
    this.guidelinesService.getAllGuidelines().subscribe((response: Guidelines[]) => {
      this.guidelines = [];
      if (response && response.length > 0) {
        this.guidelines = response;
        this.rerender();
      }
    }).add(() => {
      this.spinnerService.hide();
    });
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

  openImportGuidelines() {
    this.importForm.reset();
    this.fileInput.nativeElement.value = '';
    $('#importGuidelines').modal('toggle');
  }

  importGuidelines(form: NgForm) {
    debugger;
    const formData = new FormData();
    formData.append('upload', this.fileInput.nativeElement.files[0]);

    this.guidelinesService.importExcel(formData).subscribe(result => {
      $('#importGuidelines').modal('toggle');
      this.importMessage = result.toString();
      this.getAllGuidelines();
    });
  }

  openDeleteGuidelines(data: Guidelines) {
    this.model = { ...data };
    $('#deleteGuidelines').modal('toggle');
  }

  deleteGuidelines(data: Guidelines) {
    this.spinnerService.show();
    this.guidelinesService.delete(data.id).subscribe((response: any) => {
      $('#deleteGuidelines').modal('toggle');
    }).add(() => {
      this.spinnerService.hide();
    });
  }

  openCreateGuidelines() {
    this.model = {} as Guidelines;
    this.model.categoryId = 1;
    this.addForm.resetForm({ ...this.model });
    $('#addGuidelines').modal('toggle');
  }

  openEditHelpLink(data) {
    this.model = { ...data };
    if (this.editfileInput) {
      this.editfileInput.nativeElement.value = '';
    }
    $('#editGuidelines').modal('toggle');
  }

  onChangeCategory(newValue) {
    this.model.content = '';
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  addGuidelines(form: NgForm) {
    debugger;
    const model = { ...this.model };
    this.guidelinesService.create(model).subscribe(result => {
      $('#addGuidelines').modal('toggle');
      this.getAllGuidelines();
    });
  }

  editGuidelines(form: NgForm) {
    const model = { ...this.model };
    this.guidelinesService.edit(model).subscribe(result => {
      $('#editGuidelines').modal('toggle');
      this.getAllGuidelines();
    });
  }
}
