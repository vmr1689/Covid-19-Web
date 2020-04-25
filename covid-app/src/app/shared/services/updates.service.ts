import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import { Updates, Banner, Updatedto } from '../models';

@Injectable({ providedIn: 'root' })
export class UpdatesService {
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

    getAllBanners = () => {
        return this.http.get<Banner[]>(`${environment.apiUrl}/covid19/covid/bannerList`);
    }

    createBanner = (model: Banner) => {
        return this.http.post(`${environment.apiUrl}/covid19/covid/addBanner`, model, this.httpOptions);
    }

    editBanner = (model: Banner) => {
        return this.http.put(`${environment.apiUrl}/covid19/covid/editCovidBanner`, model, this.httpOptions);
    }

    deleteBanner = (bannerId: string) => {
        const model = { id: bannerId, deleted: true };
        return this.http.put(`${environment.apiUrl}/covid19/covid/editCovidBanner`, model, this.httpOptions);
    }

    getAllUpdates = () => {
        return this.http.get<Updatedto[]>(`${environment.apiUrl}/covid19/covid/covidUpdateList`);
    }

    createUpdates = (model: Updatedto) => {
        return this.http.post(`${environment.apiUrl}/covid19/covid/addCovidUpdate`, model, this.httpOptions);
    }

    editUpdates = (model: Updatedto) => {
        return this.http.put(`${environment.apiUrl}/covid19/covid/editCovidUpdate`, model, this.httpOptions);
    }

    DeleteUpdates = (updateId: string) => {
        const model = { id: updateId, deleted: true };
        return this.http.put(`${environment.apiUrl}/covid19/covid/editCovidUpdate`, model, this.httpOptions);
    }
}
