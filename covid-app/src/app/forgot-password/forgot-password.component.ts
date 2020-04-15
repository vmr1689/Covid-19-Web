import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { AuthenticationService } from '../shared/services';

declare var $;

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit, AfterViewInit, OnDestroy {

  public message: string;
  public errors: string;
  public submitted = false;
  public forgotPasswordForm: FormGroup;
  public email: AbstractControl;

  constructor(
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) { }


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
  }
  
  public initLoginForm(): void {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required]]
    });

    this.email = this.forgotPasswordForm.controls.email;
  }


  public onSubmit(event: Event, form: any): void {
    event.stopPropagation();
    this.submitted = true;

    if (this.forgotPasswordForm.valid) {

      this.authService.forgotPassword(this.email.value).subscribe();
    }
  }
}
