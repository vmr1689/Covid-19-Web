import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import { Organisation } from '../models';

@Injectable({ providedIn: 'root' })
export class OrganisationService {
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

    getAllOrganisations = () => {
        return this.http.get<Organisation[]>(`${environment.apiUrl}/covid/getAllOrganizationList`);
    }

    getById = (placeId: number) => {
        return this.http.get<Organisation>(`${environment.apiUrl}/organisation/getOrganisationById/` + placeId);
    }

    create = (model: Organisation) => {
        return this.http.post(`${environment.apiUrl}/covid/addOrganization`, model, this.httpOptions);
    }

    edit = (model: Organisation) => {
        return this.http.put(`${environment.apiUrl}/organisation/editOrganisation`, { model });
    }

    delete(id: number) {
        return this.http.delete(`${environment.apiUrl}/organisation/${id}`);
    }

    importExcel(formData: FormData) {
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'multipart/form-data');
        headers.append('Accept', 'application/json');
        const httpOptions = { headers };

        return this.http.post(`${environment.apiUrl}/covid/uploadOrganizationExcel`, formData, httpOptions);
    }
}
