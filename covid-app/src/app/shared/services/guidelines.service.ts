import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Guidelines } from '../models';

@Injectable({ providedIn: 'root' })
export class GuidelinesService {
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

    getAllGuidelines = () => {
        return this.http.get<Guidelines[]>(`${environment.apiUrl}/covid/covidDoAndDonotList`);
    }

    delete(id: number) {
        return this.http.delete(`${environment.apiUrl}/guidelines/${id}`);
    }

    importExcel(formData: FormData) {
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'multipart/form-data');
        headers.append('Accept', 'application/json');
        const httpOptions = { headers };

        return this.http.post(`${environment.apiUrl}/covid/uploadCovidDoAndDonotFile`, formData, httpOptions);
    }

    downloadFile(id: number): Observable<any> {
        return this.http.get(`${environment.apiUrl}/covid/downloadDoFile/${id}`, { responseType: 'blob' as 'blob' });
    }
}
