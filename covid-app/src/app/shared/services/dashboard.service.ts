import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import {
    SampleData,
    SampleStateDistrictWiseData,
    SampleWebData,
    SampleUpdatesData,
    AgeChart,
    Location
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

    getCovidInfoByPlace = (placeName: string) => {
        return this.http.get<Location>(`${environment.apiUrl}/covid/covidInfoByName/` + placeName);
    }

    getAllAgeChartData = (placeName: string) => {
        return this.http.get<any>(`${environment.apiUrl}/covid/getAgeChartData/` + placeName)
            .pipe(map((response: any) => {

                const result: AgeChart[] =
                    [
                        { age: '0-10', count: 0 },
                        { age: '11-20', count: 0 },
                        { age: '21-30', count: 0 },
                        { age: '31-40', count: 0 },
                        { age: '41-50', count: 0 },
                        { age: '51-60', count: 0 },
                        { age: '61-70', count: 0 },
                        { age: '71-80', count: 0 },
                        { age: '81-90', count: 0 },
                        { age: '91-100', count: 0 },
                    ];

                Object.keys(response).map((key, index) => {
                    result[index].count = response[key];
                });
                return result;
            }));
    }
}
