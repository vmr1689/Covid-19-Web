import { Component, OnInit, ViewChild, OnDestroy, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import * as fileSaver from 'file-saver';
import { DataTableDirective } from 'angular-datatables';

import { HELP_LINK_TYPES } from '.././seedConfig';
import { HelplinkService, SpinnerService } from '../shared/services';
import { HelpLink, HelpLinkTypes } from '../shared/models';

declare var $;

@Component({
  selector: 'app-help-link',
  templateUrl: './help-link.component.html',
  styleUrls: ['./help-link.component.css']
})
export class HelpLinkComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild(DataTableDirective, { static: false }) dtElement: DataTableDirective;
  @ViewChild('fileInput') fileInput;
  @ViewChild('editfileInput') editfileInput;
  @ViewChild('addForm') addForm: NgForm;

  public dtOptions: DataTables.Settings = {
    autoWidth: false,
    jQueryUI: true,
    dom: '<"pull-left"f><"pull-right"l>tip',
  };
  public dtTrigger = new Subject();
  public isDtInitialized = false;
  public model: HelpLink = {} as HelpLink;
  public helpLinks: HelpLink[] = [];
  public categories: HelpLinkTypes[] = HELP_LINK_TYPES;
  public defaultCategory = 1;
  public submitted = false;

  constructor(
    private cd: ChangeDetectorRef,
    private spinnerService: SpinnerService,
    private router: Router,
    private helplinkService: HelplinkService) { }

  ngOnInit(): void {
    this.getAllHelpLinks();
  }

  ngAfterViewChecked() {
    $('.dataTables_filter input, .dataTables_length select').addClass('form-control');
  }

  ngOnDestroy(): void {
    if (this.dtTrigger) {
      this.dtTrigger.unsubscribe();
    }
  }

  openHelpLink(data: HelpLink) {
    const link = data.link;
    window.open(link, '_blank');
  }

  openHelpDocument(data: any) {
    this.spinnerService.show();
    this.helplinkService.downloadFile(data.covidLinkId).subscribe(response => {
      const blob: any = new Blob([response], { type: response.type });
      //const url = window.URL.createObjectURL(blob);
      //window.open(url);
      fileSaver.saveAs(blob, data.fileName);
    }).add(() => {
      this.spinnerService.hide();
    });
  }

  getAllHelpLinks() {
    this.spinnerService.show();
    this.helplinkService.getAllHelpLinks().subscribe((response: HelpLink[]) => {
      this.helpLinks = [];
      if (response && response.length > 0) {
        this.helpLinks = response;
      }
      this.rerender();
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

  openDeleteHelpLink(data: HelpLink) {
    this.model = { ...data };
    $('#deleteHelpLink').modal('toggle');
  }

  deleteHelpLink(data: HelpLink) {
    this.spinnerService.show();
    this.helplinkService.delete(data.covidLinkId).subscribe((response: any) => {
      $('#deleteHelpLink').modal('toggle');
    }).add(() => {
      this.spinnerService.hide();
    });
  }

  openCreateHelpLink() {

    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
    this.model = {} as HelpLink;
    this.model.category = 'link';
    this.addForm.resetForm({ ...this.model });
    $('#addHelpLink').modal('toggle');
  }

  openEditHelpLink(data) {
    this.model = { ...data };
    if (this.model.category === 'document' && this.model.content) {
      this.model.content = '';
    }
    if (this.editfileInput) {
      this.editfileInput.nativeElement.value = '';
    }
    $('#editHelpLink').modal('toggle');
  }

  onChangeCategory(newValue) {
    this.model.content = '';
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  addHelpLink(form: NgForm) {
    const model = { ...this.model };

    if (this.model.category === HELP_LINK_TYPES[1].id) {
      if (this.fileInput && this.fileInput.nativeElement.files.length > 0) {
        // model.link = this.fileInput.nativeElement.files[0];

        const formData = new FormData();
        formData.append('file', this.fileInput.nativeElement.files[0]);
        formData.append('header', model.header);
        formData.append('type', HELP_LINK_TYPES[1].id);

        this.helplinkService.UploadContent(formData).subscribe(result => {
          $('#addHelpLink').modal('toggle');
          this.getAllHelpLinks();
        });
      }
    } else {
      this.helplinkService.create(model).subscribe(result => {
        $('#addHelpLink').modal('toggle');
        this.getAllHelpLinks();
      });
    }
  }

  editHelpLink(form: NgForm) {
    // const model = { ...this.model };
    // if (this.editfileInput && this.editfileInput.nativeElement.files.length > 0) {
    //   model.content = this.editfileInput.nativeElement.files[0];
    // }

    // this.helplinkService.edit(model).subscribe(result => {
    //   $('#editHelpLink').modal('toggle');
    //   this.getAllHelpLinks();
    // });
  }
}
