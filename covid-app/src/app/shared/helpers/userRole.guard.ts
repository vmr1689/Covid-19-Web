import { Injectable } from '@angular/core';
import { Router, CanActivate, Route, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AuthenticationService } from '../services';

@Injectable({ providedIn: 'root' })
export class UserRoleGuard implements CanActivate {
    constructor(
        private router: Router,
        private authService: AuthenticationService
    ) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): boolean {

        const roles = route.data.roles ? route.data.roles as Array<string> : [];
        const redirectUrl = route.data.redirectUrl ? route.data.redirectUrl as string : '/';

        if (roles && roles.length > 0) {
            const match = this.authService.roleMatch(roles);
            if (match) {
                return true;
            }
            else {
                this.router.navigate(['/' + (redirectUrl ? redirectUrl : '/') + '']);
                return false;
            }
        }
        else {
            const isSuperAdmin = this.authService.roleMatch(['SuperAdmin']);
            const isAdmin = this.authService.roleMatch(['Admin']);
            if (isSuperAdmin) {
                this.router.navigate(['/users']);
            } else if (isAdmin) {
                this.router.navigate(['/location']);
            } else if (isAdmin) {
                this.router.navigate(['/location']);
            }
            const isNotLoggedIn = this.authService.currentUserValue;
            if (!isNotLoggedIn) {
                return true;
            }
            return false;
        }
    }
}
