import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule , FormsModule} from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

// used to create fake backend
import { fakeBackendProvider, AuthGuard, JwtInterceptor, ErrorInterceptor } from './shared/helpers';
import { UserService, DashboardService } from './shared/services';

import { DirectivesModule } from './shared/directives/directives.module';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { NavigationComponent } from './navigation/navigation.component';
import { FooterComponent } from './footer/footer.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
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
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { QuarantinePatientComponent } from './quarantine-patient/quarantine-patient.component';
import { AddQuarantinePatientComponent } from './add-quarantine-patient/add-quarantine-patient.component';
import { EditQuarantinePatientComponent } from './edit-quarantine-patient/edit-quarantine-patient.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    NavigationComponent,
    FooterComponent,
    DashboardComponent,
    LoginComponent,
    LocationComponent,
    AddLocationComponent,
    EditLocationComponent,
    PatientsComponent,
    AddPatientComponent,
    LocationPatientsComponent,
    UserComponent,
    BannerComponent,
    UpdatesComponent,
    EditPatientComponent,
    ForgotPasswordComponent,
    QuarantinePatientComponent,
    AddQuarantinePatientComponent,
    EditQuarantinePatientComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    BrowserAnimationsModule,
    NgxDatatableModule,
    BsDatepickerModule.forRoot(),
    TimepickerModule.forRoot(),
    HttpClientModule,
    AppRoutingModule,
    DirectivesModule
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
