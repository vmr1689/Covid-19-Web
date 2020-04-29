import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { AuthenticationService, SpinnerService, UserService } from '../shared/services';
import { User } from '../shared/models';

declare var $;

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit, OnDestroy {
  @ViewChild('updateForm') updateForm: NgForm;
  public userSubscription: Subscription;

  public model: User = {} as User;
  public isFileValid = false;
  public image: any;

  constructor(
    private spinnerService: SpinnerService,
    private router: Router,
    private userService: UserService,
    private authService: AuthenticationService) { }

  ngOnInit(): void {
   
    this.userSubscription = this.authService.currentUser.subscribe((response: any) => {
      if (response) {
        this.model = {...response};
      } else {
        this.model = {} as User;
      }
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  navigateToMainPage() {
    this.router.navigate(['/']);
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

  updateProfile(form: NgForm) {
    debugger;
    const model = {...this.model};
    this.spinnerService.show();
    this.userService.updateUser(model.id, model).subscribe((response: any) => {
      this.navigateToMainPage();
    }).add(() => {
      this.spinnerService.hide();
    });
  }

}
