import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddGenericRecurring } from './add-generic-recurring';

describe('AddGenericRecurring', () => {
  let component: AddGenericRecurring;
  let fixture: ComponentFixture<AddGenericRecurring>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddGenericRecurring],
    }).compileComponents();

    fixture = TestBed.createComponent(AddGenericRecurring);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
