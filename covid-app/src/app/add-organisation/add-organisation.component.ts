import { Component, OnInit, EventEmitter, Input, Output, QueryList, ViewChildren, ViewChild, OnDestroy, AfterViewChecked } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { OrganisationService, SpinnerService } from '../shared/services';
import { Organisation, ngBootstrapTable } from '../shared/models';

declare var $;

@Component({
  selector: 'app-add-organisation',
  templateUrl: './add-organisation.component.html',
  styleUrls: ['./add-organisation.component.css']
})
export class AddOrganisationComponent implements OnInit {
  @ViewChild('addForm') addForm: NgForm;
  public model: Organisation = {} as Organisation;
  public isFileValid = false;
  public image: any;
  public categories: any[] = [
    { id: '1', text: 'Hospital' },
    { id: '2', text: 'Covid 19 Testing Lab' },
  ];

  constructor(
    private spinnerService: SpinnerService,
    private router: Router,
    private organisationService: OrganisationService) { }

  ngOnInit(): void {
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

  addOrganisation(form: NgForm) {
    this.spinnerService.show();
    this.organisationService.create(this.model).subscribe((response: any) => {
      this.navigateToMainPage();
    }).add(() => {
      this.spinnerService.hide();
    });
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
