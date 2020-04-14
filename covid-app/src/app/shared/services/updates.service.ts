import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import { Updates, Banner } from '../models';

@Injectable({ providedIn: 'root' })
export class UpdatesService {
    constructor(private http: HttpClient) { }

    getAllBanners = () => {
        return this.http.get<Banner[]>(`${environment.apiUrl}/updates/getAllBanners`);
    }

    getBannerById = (bannerId: number) => {
        return this.http.get<Banner>(`${environment.apiUrl}/updates/getBannerById/` + bannerId);
    }

    createBanner = (model: Banner) => {
        return this.http.post(`${environment.apiUrl}/updates/createBanner`, { model });
    }

    editBanner = (model: Banner) => {
        return this.http.put(`${environment.apiUrl}/updates/EditBanner`, { model });
    }

    deleteBanner = (bannerId: string) => {
        return this.http.delete(`${environment.apiUrl}/updates/DeleteBanner/` + bannerId);
    }

    getAllUpdates = () => {
        return this.http.get<Updates[]>(`${environment.apiUrl}/updates/getAllUpdates`);
    }

    getUpdatesById = (bannerId: number) => {
        return this.http.get<Updates>(`${environment.apiUrl}/updates/getUpdatesById/` + bannerId);
    }

    createUpdates = (model: Updates) => {
        return this.http.post(`${environment.apiUrl}/updates/createUpdates`, { model });
    }

    editUpdates = (model: Updates) => {
        return this.http.put(`${environment.apiUrl}/updates/EditUpdates`, { model });
    }

    DeleteUpdates = (updateId: number) => {
        return this.http.delete(`${environment.apiUrl}/updates/DeleteUpdates/` + updateId);
    }
}
