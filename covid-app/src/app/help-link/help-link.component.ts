import { Component, OnInit, EventEmitter, Input, Output, QueryList, ViewChildren, ViewChild, OnDestroy, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';

import { SortEvent, NgbdSortableHeader, compare } from '../shared/directives/sortable.directive';

import { HelplinkService, SpinnerService } from '../shared/services';
import { HelpLink, ngBootstrapTable } from '../shared/models';

declare var $;

@Component({
  selector: 'app-help-link',
  templateUrl: './help-link.component.html',
  styleUrls: ['./help-link.component.css']
})
export class HelpLinkComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild(DataTableDirective, { static: false }) dtElement: DataTableDirective;
  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;
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
  public categories: any[] = [
    { id: 1, text: 'Link' },
    { id: 2, text: 'Document' },
  ];
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

  openHelpLink(link: any) {
    window.open(link, '_blank');
  }

  getAllHelpLinks() {
    this.spinnerService.show();
    this.helplinkService.getAllHelpLinks().subscribe((response: HelpLink[]) => {
      this.helpLinks = [];
      if (response && response.length > 0) {
        this.helpLinks = response;
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

  openDeleteHelpLink(data: HelpLink) {
    this.model = { ...data };
    $('#deleteHelpLink').modal('toggle');
  }

  deleteHelpLink(data: HelpLink) {
    this.spinnerService.show();
    this.helplinkService.delete(data.id).subscribe((response: any) => {
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
    this.model.categoryId = 1;
    this.addForm.resetForm({ ...this.model });
    $('#addHelpLink').modal('toggle');
  }

  openEditHelpLink(data) {
    this.model = { ...data };
    if (this.model.categoryId == 2 && this.model.content) {
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
    debugger;
    const model = { ...this.model };
    if (this.fileInput && this.fileInput.nativeElement.files.length > 0) {
      model.content = this.fileInput.nativeElement.files[0];
    }

    this.helplinkService.create(model).subscribe(result => {
      $('#addHelpLink').modal('toggle');
      this.getAllHelpLinks();
    });
  }

  editHelpLink(form: NgForm) {
    const model = { ...this.model };
    if (this.editfileInput && this.editfileInput.nativeElement.files.length > 0) {
      model.content = this.editfileInput.nativeElement.files[0];
    }

    this.helplinkService.edit(model).subscribe(result => {
      $('#editHelpLink').modal('toggle');
      this.getAllHelpLinks();
    });
  }
}
