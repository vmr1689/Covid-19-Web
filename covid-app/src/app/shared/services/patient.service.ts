import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import { Patient } from '../models';

@Injectable({ providedIn: 'root' })
export class PatientService {
    constructor(private http: HttpClient) { }

    getAllPatients = () => {
        return this.http.get<Patient[]>(`${environment.apiUrl}/patient/getAllPatients`);
    }

    getPatientById = (patientId: number) => {
        return this.http.get<Patient>(`${environment.apiUrl}/patient/getPatientById/` + patientId);
    }

    createPatient = (model: Patient) => {
        return this.http.post(`${environment.apiUrl}/patient/createPatient`, { model });
    }

    editPatient = (model: Patient) => {
        return this.http.put(`${environment.apiUrl}/patient/editPatient`, { model });
    }
}
