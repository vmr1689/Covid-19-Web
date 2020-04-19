import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import { Guidelines } from '../models';

@Injectable({ providedIn: 'root' })
export class GuidelinesService {
    constructor(private http: HttpClient) { }

    getAllGuidelines = () => {
        return this.http.get<Guidelines[]>(`${environment.apiUrl}/guidelines/getAllGuidelines`);
    }

    getById = (placeId: number) => {
        return this.http.get<Guidelines>(`${environment.apiUrl}/guidelines/getGuidelinesById/` + placeId);
    }

    create = (model: Guidelines) => {
        return this.http.post(`${environment.apiUrl}/guidelines/createGuidelines`, { model });
    }

    edit = (model: Guidelines) => {
        return this.http.put(`${environment.apiUrl}/guidelines/editGuidelines`, { model });
    }

    delete(id: number) {
        return this.http.delete(`${environment.apiUrl}/guidelines/${id}`);
    }

    importExcel(formData: FormData) {
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'multipart/form-data');
        headers.append('Accept', 'application/json');
        const httpOptions = { headers };

        return this.http.post(`${environment.apiUrl}/guidelines/UploadExcel`, formData, httpOptions);
    }
}
