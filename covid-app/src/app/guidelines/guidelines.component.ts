import { Component, OnInit, ViewChild, OnDestroy, AfterViewChecked } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import * as fileSaver from 'file-saver';

import { GUIDELINES_TYPES } from '.././seedConfig';
import { GuidelinesService, SpinnerService } from '../shared/services';
import { Guidelines, GuideLinesTypes } from '../shared/models';

declare var $;

@Component({
  selector: 'app-guidelines',
  templateUrl: './guidelines.component.html',
  styleUrls: ['./guidelines.component.css']
})
export class GuidelinesComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild(DataTableDirective, { static: false }) dtElement: DataTableDirective;
  @ViewChild('fileInput') fileInput;
  @ViewChild('importForm') importForm: NgForm;
  public dtOptions: DataTables.Settings = {
    autoWidth: false,
    jQueryUI: true,
    dom: '<"pull-left"f><"pull-right"l>tip',
  };
  public dtTrigger = new Subject();
  public isDtInitialized = false;
  public model: Guidelines = {} as Guidelines;
  public guidelines: Guidelines[] = [];
  public submitted = false;
  public importMessage: string;
  public types: GuideLinesTypes[] = GUIDELINES_TYPES;

  constructor(
    private spinnerService: SpinnerService,
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
    this.guidelines = [];
    this.guidelinesService.getAllGuidelines().subscribe((response: Guidelines[]) => {
      if (response && response.length > 0) {
        this.guidelines = response;
      }
    }).add(() => {
      this.spinnerService.hide();
      this.rerender();
    });
  }

  openImageLink(data: Guidelines) {
    this.spinnerService.show();
    this.guidelinesService.downloadFile(data.id).subscribe(response => {
      const blob: any = new Blob([response], { type: response.type });
      fileSaver.saveAs(blob, data.fileName);
    }).add(() => {
      this.spinnerService.hide();
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

  openImportGuidelines() {
    this.importForm.reset();
    this.fileInput.nativeElement.value = '';
    this.model = {} as Guidelines;
    this.model.type = `DO'S`;
    this.importForm.resetForm({ ...this.model });
    $('#importGuidelines').modal('toggle');
  }

  importGuidelines(form: NgForm) {
    const model = { ...this.model };

    if (this.fileInput && this.fileInput.nativeElement.files.length > 0) {
      const formData = new FormData();
      formData.append('file', this.fileInput.nativeElement.files[0]);
      formData.append('description', model.description);
      formData.append('type', model.type);

      this.spinnerService.show();
      this.guidelinesService.importExcel(formData).subscribe(result => {
        this.importMessage = result.toString();
      }).add(() => {
        $('#importGuidelines').modal('toggle');
        this.spinnerService.hide();
        this.getAllGuidelines();
      });
    }
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
}
