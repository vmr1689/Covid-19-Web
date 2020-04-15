import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditQuarantinePatientComponent } from './edit-quarantine-patient.component';

describe('EditQuarantinePatientComponent', () => {
  let component: EditQuarantinePatientComponent;
  let fixture: ComponentFixture<EditQuarantinePatientComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditQuarantinePatientComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditQuarantinePatientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
