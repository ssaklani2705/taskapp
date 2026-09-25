import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HolidayIndex } from './holiday-index';

describe('HolidayIndex', () => {
  let component: HolidayIndex;
  let fixture: ComponentFixture<HolidayIndex>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HolidayIndex],
    }).compileComponents();

    fixture = TestBed.createComponent(HolidayIndex);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
