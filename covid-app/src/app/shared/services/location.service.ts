import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import { Location } from '../models';

@Injectable({ providedIn: 'root' })
export class LocationService {
    constructor(private http: HttpClient) { }

    getAllLocations = () => {
        return this.http.get<Location[]>(`${environment.apiUrl}/location/getAllLocations`);
    }

    getLocationById = (placeId: number) => {
        return this.http.get<Location>(`${environment.apiUrl}/location/getLocationById/` + placeId);
    }

    createLocation = (model: Location) => {
        return this.http.post(`${environment.apiUrl}/location/createLocation`, { model });
    }

    EditLocation = (model: Location) => {
        return this.http.put(`${environment.apiUrl}/location/editLocation`, { model });
    }
}
