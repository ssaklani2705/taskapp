import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericRecurringIndex } from './generic-recurring-index';

describe('GenericRecurringIndex', () => {
  let component: GenericRecurringIndex;
  let fixture: ComponentFixture<GenericRecurringIndex>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenericRecurringIndex],
    }).compileComponents();

    fixture = TestBed.createComponent(GenericRecurringIndex);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
