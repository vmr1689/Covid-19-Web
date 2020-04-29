import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import { QuarantinedPerson, QuarantinedReference } from '../models';

@Injectable({ providedIn: 'root' })
export class QuarantinedService {
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

    getAllQuarantinedPersons = () => {
        return this.http.get<QuarantinedPerson[]>(`${environment.apiUrl}/covid/quaratinedPersonList`);
    }

    editPerson = (model: QuarantinedPerson) => {
        const request = {
            ...model,
            quaratinedDate: model.quaratinedDateStr
        };  

        console.log(request);

        return this.http.put(`${environment.apiUrl}/covid/editQuaratinedPerson`, request, this.httpOptions);
    }

    getConnectedPersonInfo = (phoneNumber: string) => {
        return this.http.get<QuarantinedPerson[]>(`${environment.apiUrl}/covid/quaratinedPersonList`);
    }

    addReference = (model: QuarantinedReference) => {
        const request = {
            ...model,
            quaratinedDate: model.dateStr
        };
        return this.http.post(`${environment.apiUrl}/covid/addreference`, request, this.httpOptions);
    }

    editReference = (model: QuarantinedReference) => {
        const request = {
            ...model,
            quaratinedDate: model.dateStr
        };
        return this.http.put(`${environment.apiUrl}/covid/editreference`, request, this.httpOptions);
    }

    deleteReference(id: string) {
        const request = {
            deleted: true,
            referenceId: id
        };
        return this.http.put(`${environment.apiUrl}/covid/editreference`, request, this.httpOptions);
    }
}
