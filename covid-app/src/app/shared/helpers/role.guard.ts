import { Injectable } from '@angular/core';
import { Router, CanActivate, Route, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AuthenticationService } from '../services';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
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
            return true;
        }
    }
}
