import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DashboardComponent } from './dashboard/dashboard.component';
import { LocationComponent } from './location/location.component';
import { AddLocationComponent } from './add-location/add-location.component';
import { EditLocationComponent } from './edit-location/edit-location.component';
import { PatientsComponent } from './patients/patients.component';
import { AddPatientComponent } from './add-patient/add-patient.component';
import { LocationPatientsComponent } from './location-patients/location-patients.component';
import { UserComponent } from './user/user.component';
import { BannerComponent } from './banner/banner.component';
import { UpdatesComponent } from './updates/updates.component';
import { EditPatientComponent } from './edit-patient/edit-patient.component';
import { LoginComponent } from './login/login.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'location', component: LocationComponent },
  // { path: 'addlocation', component: AddLocationComponent },
  // { path: 'editlocation/:placeId', component: EditLocationComponent },
  { path: 'patients', component: PatientsComponent },
  { path: 'addpatient', component: AddPatientComponent },
  { path: 'editpatient/:patientId', component: EditPatientComponent },
  { path: 'location/:locationId/patients', component: LocationPatientsComponent },
  { path: 'users', component: UserComponent },
  { path: 'banner', component: BannerComponent },
  { path: 'updates', component: UpdatesComponent },
  { path: 'login', component: LoginComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
