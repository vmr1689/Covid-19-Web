import { Directive, Input, OnDestroy, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { AuthenticationService } from '../services';
import { takeUntil } from 'rxjs/operators';

@Directive({
    selector: '[appHasRole]'
})
export class HasRoleDirective implements OnInit, OnDestroy {

    @Input() appHasRole: string;
    public userSubscription: Subscription;
    isVisible = false;

    constructor(
        private viewContainerRef: ViewContainerRef,
        private templateRef: TemplateRef<any>,
        private authService: AuthenticationService
    ) { }

    ngOnInit() {
        this.userSubscription = this.authService.currentUser.subscribe((response: any) => {
            this.roleBasedMenu();
        });

    }

    roleBasedMenu() {

        let currentUserRoles = this.authService.currentUserRoles;

        if (currentUserRoles.length > 0 && this.appHasRole && this.appHasRole.length > 0) {
            if (currentUserRoles.some(r => this.appHasRole.includes(r))) {

                if (!this.isVisible) {

                    this.isVisible = true;
                    this.viewContainerRef.createEmbeddedView(this.templateRef);
                }
            } else {
                this.isVisible = false;
                this.viewContainerRef.clear();
            }
        }
        else {
            // if (!this.isVisible) {
            //     this.isVisible = true;
            //     this.viewContainerRef.createEmbeddedView(this.templateRef);
            // }
            this.isVisible = false;
            this.viewContainerRef.clear();
        }
    }
    ngOnDestroy() {
        if (this.userSubscription) {
            this.userSubscription.unsubscribe();
        }
    }
}
