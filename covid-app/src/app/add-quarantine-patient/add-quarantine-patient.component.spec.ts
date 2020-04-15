import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddQuarantinePatientComponent } from './add-quarantine-patient.component';

describe('AddQuarantinePatientComponent', () => {
  let component: AddQuarantinePatientComponent;
  let fixture: ComponentFixture<AddQuarantinePatientComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddQuarantinePatientComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddQuarantinePatientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
