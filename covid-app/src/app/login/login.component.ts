import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, Subscription, forkJoin } from 'rxjs';

import { AuthenticationService, SpinnerService } from '../shared/services';
import { User } from '../shared/models';

declare var $;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {

  public message: string;
  public loginForm: FormGroup;
  public email: AbstractControl;
  public password: AbstractControl;
  public submitted = false;
  public userSubscription: Subscription;

  constructor(
    private spinnerService: SpinnerService,
    private authenticationService: AuthenticationService,
    private fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.initLoginForm();
  }

  ngAfterViewInit() {
    $('body').addClass('login-page');
    $('body').css({ background: '#ecf0f5' });
  }

  ngOnDestroy() {
    $('body').removeClass('login-page');
    $('body').css({ background: '' });

    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  public initLoginForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', Validators.required]
    });

    this.email = this.loginForm.controls.email;
    this.password = this.loginForm.controls.password;
  }

  public onSubmit(event: Event, form: any): void {
    event.stopPropagation();
    this.submitted = true;
    if (this.loginForm.valid) {
      this.spinnerService.show();
      this.userSubscription = this.authenticationService.login(form.email, form.password).subscribe((result: any) => {
        const isSuperAdmin = this.authenticationService.roleMatch(['SuperAdmin']);
        const isAdmin = this.authenticationService.roleMatch(['Admin']);
        if (isSuperAdmin) {
          this.router.navigate(['/users']);
        }
         else if (isAdmin) {
          this.router.navigate(['/location']);
         }
      }, error => {
        if (error) {
          this.message = error;
        }
      }).add(() => {
        this.spinnerService.hide();
      });
    }
  }
}
