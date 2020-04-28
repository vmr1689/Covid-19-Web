import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import { QuarantinedPerson } from '../models';

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
        const request = {...model,
            quaratinedDate: model.quaratinedDateStr
        };

        return this.http.put(`${environment.apiUrl}/covid/editCovidPatient`, request, this.httpOptions);
    }

    getConnectedPersonInfo = (phoneNumber: string) => {
        return this.http.get<QuarantinedPerson[]>(`${environment.apiUrl}/covid/quaratinedPersonList`);
    }
}
