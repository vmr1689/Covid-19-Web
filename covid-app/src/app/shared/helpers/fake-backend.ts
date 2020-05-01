import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, mergeMap, materialize, dematerialize } from 'rxjs/operators';

import SampleDataJson from '../../sample_data.json';
import SampleUsersJson from '../../users.json';

import { SampleData } from '../models';

// array in local storage for registered users
let users = SampleUsersJson;

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const { url, method, headers, body } = request;

        // wrap in delayed observable to simulate server api call
        return of(null)
            .pipe(mergeMap(handleRoute))
            .pipe(materialize()) // call materialize and dematerialize to ensure delay even if an error is thrown
            .pipe(delay(500))
            .pipe(dematerialize());

        function handleRoute() {
            switch (true) {
                case url.endsWith('/users/authenticate') && method === 'POST':
                    return authenticate();
                case url.endsWith('/users/register') && method === 'POST':
                    return register();
                case url.endsWith('/users') && method === 'GET':
                    return getUsers();
                case url.match(/\/users\/\d+$/) && method === 'DELETE':
                    return deleteUser();
                case url.match(/\/users\/\d+$/) && method === 'GET':
                    return getUser();
                case url.match(/\/users\/\d+$/) && method === 'PUT':
                    return updateUser();

                case url.endsWith('/dashboard/getDetails') && method === 'GET':
                    return dashboardData();

                default:
                    // pass through any requests not handled above
                    return next.handle(request);
            }
        }

        // route functions

        function authenticate() {
            const { username, password } = body;
            const user = users.find(x => x.username === username && x.password === password);
            if (!user) {
                return error('Username or password is incorrect');
            }
            return ok({
                id: user.id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                token: 'fake-jwt-token',
                phoneNumber: user.phoneNumber,
                isEmailConfirmed: user.isEmailConfirmed,
                role: user.role,
                status: user.status,
                hospitalId: user.hospitalId,
                hospitalAddress: user.hospitalAddress,
                hospitalName: user.hospitalName,
                placeId: user.placeId,
                placeName: user.placeName
            });
        }

        function register() {
            const user = body;

            if (users.find(x => x.username === user.username)) {
                return error('Username "' + user.username + '" is already taken');
            }

            user.id = users.length ? Math.max(...users.map(x => x.id)) + 1 : 1;
            users.push(user);
            localStorage.setItem('users', JSON.stringify(users));

            return ok();
        }

        function getUsers() {
            if (!isLoggedIn()) {
                return unauthorized();
            }
            return ok(users);
        }

        function deleteUser() {
            if (!isLoggedIn()) {
                return unauthorized();
            }

            users = users.filter(x => x.id !== idFromUrl());
            localStorage.setItem('users', JSON.stringify(users));
            return ok();
        }

        function updateUser() {
            const user = body;

            users = {
                ...users,
                user
            };

            return ok();
        }

        function getUser() {
            if (!isLoggedIn()) {
                return unauthorized();
            }

            users = users.filter(x => x.id === idFromUrl());
            if (users.length > 0) {
                return ok(users[0]);
            }
            return ok(null);
        }

        // helper functions

        function ok(body?) {
            return of(new HttpResponse({ status: 200, body }));
        }

        function error(message) {
            return throwError({ error: { message } });
        }

        function unauthorized() {
            return throwError({ status: 401, error: { message: 'Unauthorised' } });
        }

        function isLoggedIn() {
            // return headers.get('Authorization') === 'Bearer fake-jwt-token';
            return true;
        }

        function idFromUrl() {
            const urlParts = url.split('/');
            return parseInt(urlParts[urlParts.length - 1]);
        }

        function dashboardData() {
            const mainData = SampleDataJson;
            const castObject = mainData as SampleData;
            return ok(castObject);
        }
    }
}

export const fakeBackendProvider = {
    // use fake backend in place of Http service for backend-less development
    provide: HTTP_INTERCEPTORS,
    useClass: FakeBackendInterceptor,
    multi: true
};
