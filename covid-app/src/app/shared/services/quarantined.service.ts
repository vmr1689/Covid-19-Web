import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import { QuarantinedPerson } from '../models';

@Injectable({ providedIn: 'root' })
export class QuarantinedService {
    constructor(private http: HttpClient) { }

    getAllQuarantinedPersons = () => {
        return this.http.get<QuarantinedPerson[]>(`${environment.apiUrl}/covid/quaratinedPersonList`);
    }
}
