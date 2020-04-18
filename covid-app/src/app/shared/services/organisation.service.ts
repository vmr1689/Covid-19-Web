import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import { Organisation } from '../models';

@Injectable({ providedIn: 'root' })
export class OrganisationService {
    constructor(private http: HttpClient) { }

    getAllOrganisations = () => {
        return this.http.get<Organisation[]>(`${environment.apiUrl}/organisation/getAllOrganisations`);
    }

    getById = (placeId: number) => {
        return this.http.get<Organisation>(`${environment.apiUrl}/organisation/getOrganisationById/` + placeId);
    }

    create = (model: Organisation) => {
        return this.http.post(`${environment.apiUrl}/organisation/createOrganisation`, { model });
    }

    edit = (model: Organisation) => {
        return this.http.put(`${environment.apiUrl}/organisation/editOrganisation`, { model });
    }

    delete(id: number) {
        return this.http.delete(`${environment.apiUrl}/organisation/${id}`);
    }
}
