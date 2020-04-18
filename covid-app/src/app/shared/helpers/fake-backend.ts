import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, mergeMap, materialize, dematerialize } from 'rxjs/operators';

import SampleDataJson from '../../sample_data.json';
import StateDistrictWiseDataJson from '../../sample_state-district-wise.json';
import SampleBannerJson from '../../sample_web_data.json';
import SampleUpdatesJson from '../../sample_updates.json';
import SampleLocationsJson from '../../locations.json';
import SamplePatientsJson from '../../patients.json';
import SampleUsersJson from '../../users.json';
import SampleBannerJson1 from '../../banner.json';
import SampleUpdatedDtoJson from '../../updatedto.json';
import SampleOrganisationJson from '../../organisation.json';
import SampleHelpLinksJson from '../../helplinks.json';
import {
    SampleData,
    SampleStateDistrictWiseData,
    SampleUpdatesData,
    SampleWebData,
    Location,
    Patient,
    Banner,
    Updates,
    Updatedto,
    Organisation,
    HelpLink
} from '../models';

// array in local storage for registered users
let users = SampleUsersJson;
//let users = JSON.parse(localStorage.getItem('users')) || [];

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
                case url.endsWith('dashboard/getStateDistrictData') && method === 'GET':
                    return stateDistrictData();
                case url.endsWith('dashboard/getBanner') && method === 'GET':
                    return bannerData();
                case url.endsWith('dashboard/getUpdates') && method === 'GET':
                    return updatesData();
                case url.endsWith('location/getAllLocations') && method === 'GET':
                    return getAllLocations();
                case url.match(/\/getLocationById\/\d+$/) && method === 'GET':
                    return getLocation();
                case url.endsWith('location/createLocation') && method === 'POST':
                    return createLocation();
                case url.endsWith('location/editLocation') && method === 'PUT':
                    return editLocation();
                case url.endsWith('patient/getAllPatients') && method === 'GET':
                    return getAllPatients();
                case url.match(/\/getPatientById\/\d+$/) && method === 'GET':
                    return getPatient();
                case url.endsWith('patient/createPatient') && method === 'POST':
                    return createPatient();
                case url.endsWith('patient/editPatient') && method === 'PUT':
                    return editPatient();
                case url.match(/\/deletePatient\/\d+$/) && method === 'DELETE':
                    return deletePatient();

                case url.endsWith('updates/getAllBanners') && method === 'GET':
                    return getAllBanners();
                case url.match(/\/getBannerById\/\d+$/) && method === 'GET':
                    return getBanner();
                case url.endsWith('updates/createBanner') && method === 'POST':
                    return createBanner();
                case url.endsWith('updates/EditBanner') && method === 'PUT':
                    return editBanner();
                case url.match(/\/DeleteBanner\/\d+$/) && method === 'DELETE':
                    return deleteBanner();

                case url.endsWith('updates/getAllUpdates') && method === 'GET':
                    return getAllUpdates();
                case url.match(/\/getUpdatesById\/\d+$/) && method === 'GET':
                    return getPatient();
                case url.endsWith('updates/createUpdates') && method === 'POST':
                    return createUpdates();
                case url.endsWith('updates/EditUpdates') && method === 'PUT':
                    return editUpdates();
                case url.match(/\/DeleteUpdates\/\d+$/) && method === 'DELETE':
                    return deleteUpdates();

                case url.endsWith('organisation/getAllOrganisations') && method === 'GET':
                    return getAllOrganisations();
                case url.match(/\/getOrganisationById\/\d+$/) && method === 'GET':
                    return getOrganisation();
                case url.endsWith('organisation/createOrganisation') && method === 'POST':
                    return createOrganisation();
                case url.endsWith('organisation/editOrganisation') && method === 'PUT':
                    return editOrganisation();
                case url.match(/\/organisation\/\d+$/) && method === 'DELETE':
                    return deleteOrganisation();

                case url.endsWith('helplinks/getAllHelpLinks') && method === 'GET':
                    return getAllHelpLinks();
                case url.match(/\/getHelpLinksById\/\d+$/) && method === 'GET':
                    return getHelpLinks();
                case url.endsWith('helplinks/createHelpLink') && method === 'POST':
                    return createHelpLinks();
                case url.endsWith('helplinks/editHelpLink') && method === 'PUT':
                    return editHelpLinks();
                case url.match(/\/helplinks\/\d+$/) && method === 'DELETE':
                    return deleteHelpLinks();

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
                hospitalAddress: user.hospitalAddress
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
            //return headers.get('Authorization') === 'Bearer fake-jwt-token';
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

        function stateDistrictData() {
            const mainData = StateDistrictWiseDataJson;
            const castObject = mainData as SampleStateDistrictWiseData;
            return ok(castObject);
        }

        function bannerData() {
            const mainData = SampleBannerJson;
            const castObject = mainData as SampleWebData;
            return ok(castObject);
        }

        function updatesData() {
            const mainData = SampleUpdatesJson;
            const castObject = mainData as SampleUpdatesData;
            return ok(castObject);
        }

        function getAllLocations() {
            const mainData = SampleLocationsJson;
            const castObject = mainData as Location[];
            return ok(castObject);
        }

        function createLocation() {
            const user = body;
            return ok(true);
        }

        function editLocation() {
            const user = body;
            return ok(true);
        }

        function getLocation() {
            const mainData = SampleLocationsJson;
            const castObject = mainData as Location[];
            const aa = castObject[2];
            return ok(aa);
        }

        function getAllPatients() {
            const mainData = SamplePatientsJson;
            const castObject = mainData as Patient[];
            return ok(castObject);
        }

        function createPatient() {
            const user = body;
            return ok(true);
        }

        function editPatient() {
            const user = body;
            return ok(true);
        }

        function deletePatient() {
            const user = body;
            return ok(true);
        }

        function getPatient() {
            const mainData = SamplePatientsJson;
            const castObject = mainData as Patient[];
            const aa = castObject[2];
            return ok(aa);
        }

        function getAllBanners() {
            const mainData = SampleBannerJson1;
            const castObject = mainData as Banner[];
            return ok(castObject);
        }

        function createBanner() {
            const user = body;
            return ok(true);
        }

        function editBanner() {
            const user = body;
            return ok(true);
        }

        function deleteBanner() {
            const user = body;
            return ok(true);
        }

        function getBanner() {
            const mainData = SamplePatientsJson;
            const castObject = mainData as Banner[];
            const aa = castObject[2];
            return ok(aa);
        }


        function getAllUpdates() {
            const mainData = SampleUpdatedDtoJson;
            const castObject = mainData as Updatedto[];
            return ok(castObject);
        }

        function createUpdates() {
            const user = body;
            return ok(true);
        }

        function editUpdates() {
            const user = body;
            return ok(true);
        }

        function deleteUpdates() {
            const user = body;
            return ok(true);
        }

        function getUpdates() {
            const mainData = SampleUpdatedDtoJson;
            const castObject = mainData as Updatedto[];
            const aa = castObject[2];
            return ok(aa);
        }


        function getAllOrganisations() {
            const mainData = SampleOrganisationJson;
            const castObject = mainData as Organisation[];
            return ok(castObject);
        }

        function getOrganisation() {
            const mainData = SampleOrganisationJson;
            const castObject = mainData as Organisation[];
            const aa = castObject[2];
            return ok(aa);
        }

        function createOrganisation() {
            const user = body;
            return ok(true);
        }

        function editOrganisation() {
            const user = body;
            return ok(true);
        }

        function deleteOrganisation() {
            const user = body;
            return ok(true);
        }


        function getAllHelpLinks() {
            const mainData = SampleHelpLinksJson;
            const castObject = mainData as HelpLink[];
            return ok(castObject);
        }

        function getHelpLinks() {
            const mainData = SampleOrganisationJson;
            const castObject = mainData as HelpLink[];
            const aa = castObject[0];
            return ok(aa);
        }

        function createHelpLinks() {
            const user = body;
            return ok(true);
        }

        function editHelpLinks() {
            const user = body;
            return ok(true);
        }

        function deleteHelpLinks() {
            const user = body;
            return ok(true);
        }

    }
}

export const fakeBackendProvider = {
    // use fake backend in place of Http service for backend-less development
    provide: HTTP_INTERCEPTORS,
    useClass: FakeBackendInterceptor,
    multi: true
};
