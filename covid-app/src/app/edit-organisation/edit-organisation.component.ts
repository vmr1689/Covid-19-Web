import { Component, OnInit, EventEmitter, Input, Output, QueryList, ViewChildren, ViewChild, OnDestroy, AfterViewChecked } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { ORGANISATION_TYPES } from '.././seedConfig';
import { OrganisationService, SpinnerService } from '../shared/services';
import { Organisation, OrganisationTypes } from '../shared/models';

declare var $;

@Component({
  selector: 'app-edit-organisation',
  templateUrl: './edit-organisation.component.html',
  styleUrls: ['./edit-organisation.component.css']
})
export class EditOrganisationComponent implements OnInit {
  @ViewChild('editForm') editForm: NgForm;

  public model: Organisation = {} as Organisation;
  public isFileValid = false;
  public image: any;
  public categories: OrganisationTypes[] = ORGANISATION_TYPES;
  public organisationId: number;

  constructor(
    private spinnerService: SpinnerService,
    private router: Router,
    private organisationService: OrganisationService,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      this.organisationId = Number.parseInt(params.get('organisationId'));
      this.getAllOrganisations();
    });
  }

  getAllOrganisations() {
    this.spinnerService.show();
    this.organisationService.getAllOrganisations().subscribe((response: Organisation[]) => {
      if (response && response.length > 0) {
        this.model = response.find(x=> x.covidOrganizationId == this.organisationId);
      }
    }).add(() => {
      this.spinnerService.hide();
    });
  }

  getOrganisation() {
    this.spinnerService.show();
    this.organisationService.getById(this.organisationId).subscribe((response: Organisation) => {
      this.model = {} as Organisation;
      if (response) {
        this.model = response;
      }
    }).add(() => {
      this.spinnerService.hide();
    });
  }

  navigateToMainPage() {
    this.router.navigate(['/organisation']);
  }

  changeListener($event, file): void {

    this.isFileValid = false;
    const fileList: FileList = $event.target.files;
    if ($event.target.files.length > 0) {
      const fileSize = $event.srcElement.files[0].size;

      const fileType = $event.srcElement.files[0].type;

      if ((fileType === 'image/png' || fileType === 'image/jpeg' || fileType === 'image/gif') &&
        fileSize <= (512 * 1024)) {

        this.readThis($event.target);
        this.isFileValid = false;
      } else {

        this.isFileValid = true;
      }
    }
  }

  readThis(inputValue: any): void {

    const file: File = inputValue.files[0];
    const myReader: FileReader = new FileReader();

    myReader.onloadend = (e) => {
      this.image = myReader.result;
      this.model.profilePic = this.image;
    };
    myReader.readAsDataURL(file);
    this.model.profilePic = this.image;
  }

  editOrganisation(form: NgForm) {
    this.spinnerService.show();
    this.organisationService.edit(this.model).subscribe((response: any) => {
      this.navigateToMainPage();
    }).add(() => {
      this.spinnerService.hide();
    });
  }

}
