import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationQuarantinePersonsComponent } from './location-quarantine-persons.component';

describe('LocationQuarantinePersonsComponent', () => {
  let component: LocationQuarantinePersonsComponent;
  let fixture: ComponentFixture<LocationQuarantinePersonsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LocationQuarantinePersonsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationQuarantinePersonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
