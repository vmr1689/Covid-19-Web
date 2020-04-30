import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule , FormsModule} from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { DataTablesModule } from 'angular-datatables';
import { NgSelect2Module } from 'ng-select2';

import { environment } from '../environments/environment';

// used to create fake backend
import { fakeBackendProvider, AuthGuard, JwtInterceptor, ErrorInterceptor } from './shared/helpers';
import { UserService, DashboardService } from './shared/services';

import { HasRoleDirective } from './shared/directives/has-role.directive';
import { DirectivesModule } from './shared/directives/directives.module';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { NavigationComponent } from './navigation/navigation.component';
import { FooterComponent } from './footer/footer.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { LocationComponent } from './location/location.component';
import { PatientsComponent } from './patients/patients.component';
import { LocationPatientsComponent } from './location-patients/location-patients.component';
import { UserComponent } from './user/user.component';
import { BannerComponent } from './banner/banner.component';
import { UpdatesComponent } from './updates/updates.component';
import { EditPatientComponent } from './edit-patient/edit-patient.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { QuarantinePatientComponent } from './quarantine-patient/quarantine-patient.component';
import { EditQuarantinePatientComponent } from './edit-quarantine-patient/edit-quarantine-patient.component';
import { SpinnerComponent } from './spinner/spinner.component';
import { OrganisationComponent } from './organisation/organisation.component';
import { AddOrganisationComponent } from './add-organisation/add-organisation.component';
import { EditOrganisationComponent } from './edit-organisation/edit-organisation.component';
import { HelpLinkComponent } from './help-link/help-link.component';
import { GuidelinesComponent } from './guidelines/guidelines.component';
import { LinksComponent } from './links/links.component';
import { EssentialsComponent } from './essentials/essentials.component';
import { LocationQuarantinePersonsComponent } from './location-quarantine-persons/location-quarantine-persons.component';
import { UserProfileComponent } from './user-profile/user-profile.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    NavigationComponent,
    FooterComponent,
    DashboardComponent,
    LoginComponent,
    LocationComponent,
    PatientsComponent,
    LocationPatientsComponent,
    UserComponent,
    BannerComponent,
    UpdatesComponent,
    EditPatientComponent,
    ForgotPasswordComponent,
    QuarantinePatientComponent,
    EditQuarantinePatientComponent,
    HasRoleDirective,
    SpinnerComponent,
    OrganisationComponent,
    AddOrganisationComponent,
    EditOrganisationComponent,
    HelpLinkComponent,
    GuidelinesComponent,
    LinksComponent,
    EssentialsComponent,
    LocationQuarantinePersonsComponent,
    UserProfileComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    BsDatepickerModule.forRoot(),
    TimepickerModule.forRoot(),
    HttpClientModule,
    DataTablesModule,
    AppRoutingModule,
    DirectivesModule,
    NgSelect2Module
  ],
  providers: [
    AuthGuard,
    DashboardService,
    UserService,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },

    // provider used to create fake backend
    fakeBackendProvider
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
