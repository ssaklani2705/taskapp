import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRecurring } from './add-recurring';

describe('AddRecurring', () => {
  let component: AddRecurring;
  let fixture: ComponentFixture<AddRecurring>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddRecurring],
    }).compileComponents();

    fixture = TestBed.createComponent(AddRecurring);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
