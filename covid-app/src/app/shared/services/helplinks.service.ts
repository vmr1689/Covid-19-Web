import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import { HelpLink } from '../models';

@Injectable({ providedIn: 'root' })
export class HelplinkService {
    constructor(private http: HttpClient) { }

    getAllHelpLinks = () => {
        return this.http.get<HelpLink[]>(`${environment.apiUrl}/helplinks/getAllHelpLinks`);
    }

    getById = (placeId: number) => {
        return this.http.get<HelpLink>(`${environment.apiUrl}/helplinks/getHelpLinksById/` + placeId);
    }

    create = (model: HelpLink) => {
        return this.http.post(`${environment.apiUrl}/helplinks/createHelpLink`, { model });
    }

    edit = (model: HelpLink) => {
        return this.http.put(`${environment.apiUrl}/helplinks/editHelpLink`, { model });
    }

    delete(id: number) {
        return this.http.delete(`${environment.apiUrl}/helplinks/${id}`);
    }

    UploadContent(formData: FormData) {
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'multipart/form-data');
        headers.append('Accept', 'application/json');
        const httpOptions = { headers };

        return this.http.post(`${environment.apiUrl}/helplinks/UploadContent`, formData, httpOptions);
    }
}
