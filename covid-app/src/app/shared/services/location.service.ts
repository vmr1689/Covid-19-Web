import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import { Location, LocationPatient, LocationQuarantine } from '../models';

@Injectable({ providedIn: 'root' })
export class LocationService {
    public headers: HttpHeaders;
    public httpOptions: {};

    constructor(private http: HttpClient) {
        this.headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        this.httpOptions = {
            headers: this.headers
        };
    }

    getAllLocationsDuplicate = (target?: any) => {
        return this.http.get<Location>(`${environment.apiUrl}/covid/covidInfoByName/` + target);
    }

    getAllLocations = (target?: any) => {
        return this.http.get<Location[]>(`${environment.apiUrl}/covid/covidInfoByName/` + target);
    }

    getLocationById = (placeId: number) => {
        return this.http.get<Location>(`${environment.apiUrl}/location/getLocationById/` + placeId);
    }

    createLocation = (model: Location, rootName?: string) => {
        let requestModel = null;

        if (rootName) {
            requestModel = {
                name: rootName,
                placeInfo: {
                    latitude: model.latitude,
                    longitude: model.longitude,
                    severity: 'Low',
                    type: model.type,
                    placeName: model.placeName
                }
            };
        } else {
            requestModel = {
                placeInfo: {
                    latitude: model.latitude,
                    longitude: model.longitude,
                    severity: 'Low',
                    type: model.type,
                    placeName: model.placeName
                }
            };
        }

        return this.http.post(`${environment.apiUrl}/covid/addNewPlace`, requestModel, this.httpOptions);
    }

    EditLocation = (model: Location) => {
        return this.http.put(`${environment.apiUrl}/location/editLocation`, model, this.httpOptions);
    }

    createPatient = (model: LocationPatient) => {
        const request = {
            firstName: model.firstName,
            lastName: model.lastName,
            email: model.email,
            phoneNumber: model.phoneNumber,
            gender: model.gender,
            city: model.placeName,
            age: model.age,
            address: model.address,
            country: environment.targetLocation
        };
        return this.http.post(`${environment.apiUrl}/covid/addNewPatient`, request, this.httpOptions);
    }

    createQurarantine = (model: LocationQuarantine) => {
        const request = {
            firstName: model.firstName,
            lastName: model.lastName,
            email: model.email,
            phoneNumber: model.phoneNumber,
            gender: model.gender,
            city: model.placeName,
            age: model.age,
            address: model.address,
            quaratinedDate: model.quaratinedDateStr,
            country: environment.targetLocation
        };
        console.log(request);
        return this.http.post(`${environment.apiUrl}/covid/addQuaratinedPerson`, request, this.httpOptions);
    }
}
