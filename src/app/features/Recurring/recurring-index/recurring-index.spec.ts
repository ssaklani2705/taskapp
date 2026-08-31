import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecurringIndex } from './recurring-index';

describe('RecurringIndex', () => {
  let component: RecurringIndex;
  let fixture: ComponentFixture<RecurringIndex>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecurringIndex],
    }).compileComponents();

    fixture = TestBed.createComponent(RecurringIndex);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
