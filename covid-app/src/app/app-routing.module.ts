import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard, RoleGuard } from './shared/helpers';

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
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { QuarantinePatientComponent } from './quarantine-patient/quarantine-patient.component';
import { AddQuarantinePatientComponent } from './add-quarantine-patient/add-quarantine-patient.component';
import { EditQuarantinePatientComponent } from './edit-quarantine-patient/edit-quarantine-patient.component';
import { OrganisationComponent } from './organisation/organisation.component';
import { AddOrganisationComponent } from './add-organisation/add-organisation.component';
import { EditOrganisationComponent } from './edit-organisation/edit-organisation.component';
import { HelpLinkComponent } from './help-link/help-link.component';
import { GuidelinesComponent } from './guidelines/guidelines.component';
import { LinksComponent } from './links/links.component';
import { EssentialsComponent } from './essentials/essentials.component';

const levelOneRole = {
  data: {
    roles: ['Admin'],
    redirectUrl: ['/users']
  },
  canActivate: [AuthGuard, RoleGuard]
};

const superAdminRole = {
  data: {
    roles: ['SuperAdmin'],
    redirectUrl: ['/']
  },
  canActivate: [AuthGuard, RoleGuard]
};

const routes: Routes = [
  // { path: 'addlocation', component: AddLocationComponent },
  // { path: 'editlocation/:placeId', component: EditLocationComponent },
  {
    path: '',
    component: DashboardComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
  },
  {
    path: 'links',
    component: LinksComponent,
  },
  {
    path: 'essentials',
    component: EssentialsComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'forgotpassword',
    component: ForgotPasswordComponent
  },
  {
    path: 'location',
    component: LocationComponent,
    data: levelOneRole.data,
    canActivate: levelOneRole.canActivate,
  },
  {
    path: 'patients',
    component: PatientsComponent,
    data: levelOneRole.data,
    canActivate: levelOneRole.canActivate,
  },
  {
    path: 'addpatient',
    component: AddPatientComponent,
    data: levelOneRole.data,
    canActivate: levelOneRole.canActivate,
  },
  {
    path: 'editpatient/:patientId',
    component: EditPatientComponent,
    data: levelOneRole.data,
    canActivate: levelOneRole.canActivate,
  },
  {
    path: 'location/:locationId/patients',
    component: LocationPatientsComponent,
    data: levelOneRole.data,
    canActivate: levelOneRole.canActivate,
  },
  {
    path: 'banner',
    component: BannerComponent,
    data: levelOneRole.data,
    canActivate: levelOneRole.canActivate,
  },
  {
    path: 'updates',
    component: UpdatesComponent,
    data: levelOneRole.data,
    canActivate: levelOneRole.canActivate,
  },
  {
    path: 'quarantinepersons',
    component: QuarantinePatientComponent,
    data: levelOneRole.data,
    canActivate: levelOneRole.canActivate,
  },
  {
    path: 'addquarantineperson',
    component: AddQuarantinePatientComponent,
    data: levelOneRole.data,
    canActivate: levelOneRole.canActivate,
  },
  {
    path: 'editquarantineperson/:patientId',
    component: EditQuarantinePatientComponent,
    data: levelOneRole.data,
    canActivate: levelOneRole.canActivate,
  },
  {
    path: 'organisation',
    component: OrganisationComponent,
    data: levelOneRole.data,
    canActivate: levelOneRole.canActivate,
  },
  {
    path: 'addorganisation',
    component: AddOrganisationComponent,
    data: levelOneRole.data,
    canActivate: levelOneRole.canActivate,
  },
  {
    path: 'editorganisation/:organisationId',
    component: EditOrganisationComponent,
    data: levelOneRole.data,
    canActivate: levelOneRole.canActivate,
  },
  {
    path: 'helplinks',
    component: HelpLinkComponent,
    data: levelOneRole.data,
    canActivate: levelOneRole.canActivate,
  },
  {
    path: 'guidelines',
    component: GuidelinesComponent,
    data: levelOneRole.data,
    canActivate: levelOneRole.canActivate,
  },
  {
    path: 'users',
    component: UserComponent,
    data: superAdminRole.data,
    canActivate: superAdminRole.canActivate,
  }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
