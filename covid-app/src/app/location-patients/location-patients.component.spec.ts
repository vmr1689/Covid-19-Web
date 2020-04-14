import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationPatientsComponent } from './location-patients.component';

describe('LocationPatientsComponent', () => {
  let component: LocationPatientsComponent;
  let fixture: ComponentFixture<LocationPatientsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LocationPatientsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationPatientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
