import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuarantinePatientComponent } from './quarantine-patient.component';

describe('QuarantinePatientComponent', () => {
  let component: QuarantinePatientComponent;
  let fixture: ComponentFixture<QuarantinePatientComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuarantinePatientComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuarantinePatientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
