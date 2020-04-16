import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { AuthenticationService } from '../shared/services';
import { User } from '../shared/models';
import { Router } from '@angular/router';

declare var $: any;


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {

  public userSubscription: Subscription;
  public currentUser: User = {} as User;

  constructor(
    private router: Router,
    private authService: AuthenticationService) { }

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser.subscribe((response: any) => {
      if (response) {
        this.currentUser = response;
      } else {
        this.currentUser = {} as User;
      }
    });
  }

  signOut() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}

