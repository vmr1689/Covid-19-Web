import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { HelpLink } from '../models';

@Injectable({ providedIn: 'root' })
export class HelplinkService {
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

    getAllHelpLinks = () => {
        return this.http.get<HelpLink[]>(`${environment.apiUrl}/covid/covidLinksList`);
    }

    create = (model: HelpLink) => {
        return this.http.post(`${environment.apiUrl}/covid/addCovidLink`, model);
    }

    delete(id: number) {
        return this.http.delete(`${environment.apiUrl}/helplinks/${id}`);
    }

    UploadContent(formData: FormData) {
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'multipart/form-data');
        headers.append('Accept', 'application/json');
        const httpOptions = { headers };

        return this.http.post(`${environment.apiUrl}/covid/uploadCovidLinkFile`, formData, httpOptions);
    }

    downloadFile(id: number): Observable<any> {
        return this.http.get(`${environment.apiUrl}/covid/downloadFile/${id}`, { responseType: 'blob' as 'blob' });
    }
}
