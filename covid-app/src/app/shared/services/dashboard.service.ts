import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import {
    SampleData,
    SampleStateDistrictWiseData,
    SampleWebData,
    SampleUpdatesData
 } from '../models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
    constructor(private http: HttpClient) { }

    getDetails = () => {
        return this.http.get<SampleData>(`${environment.apiUrl}/dashboard/getDetails`);
    }

    getStateDistrictData = () => {
        return this.http.get<SampleStateDistrictWiseData>(`${environment.apiUrl}/dashboard/getStateDistrictData`);
    }

    getBanner = () => {
        return this.http.get<SampleWebData>(`${environment.apiUrl}/dashboard/getBanner`);
    }

    getUpdates = () => {
        return this.http.get<SampleUpdatesData[]>(`${environment.apiUrl}/dashboard/getUpdates`);
    }
}
