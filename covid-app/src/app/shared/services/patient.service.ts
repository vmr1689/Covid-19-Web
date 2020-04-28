import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import { Patient, PatientLocationInfo, PatientDeviceInfo } from '../models';

@Injectable({ providedIn: 'root' })
export class PatientService {
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

    getAllPatients = () => {
        return this.http.get<Patient[]>(`${environment.apiUrl}/covid/covid19PatientList`);
    }

    getPatientById = (patientId: number) => {
        return this.http.get<Patient>(`${environment.apiUrl}/patient/getPatientById/` + patientId);
    }

    createPatient = (model: Patient) => {
        return this.http.post(`${environment.apiUrl}/patient/createPatient`, { model });
    }

    editPatient = (model: Patient) => {
        return this.http.put(`${environment.apiUrl}/covid/editCovidPatient`, model, this.httpOptions);
    }

    deletePatient = (patientId: number) => {
        return this.http.delete(`${environment.apiUrl}/patient/deletePatient/` + patientId);
    }

    getLocationInfo = (phoneNumber: string) => {
        return this.http.get<PatientLocationInfo[]>(`${environment.apiUrl}/covid/quarPeopleLocation/` + phoneNumber);
    }

    getDeviceInfo = (phoneNumber: string) => {
        return this.http.get<PatientDeviceInfo[]>(`${environment.apiUrl}/covid/quarPeopleDevice/` + phoneNumber);
    }
}
