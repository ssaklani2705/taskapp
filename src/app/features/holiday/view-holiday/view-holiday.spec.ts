import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewHoliday } from './view-holiday';

describe('ViewHoliday', () => {
  let component: ViewHoliday;
  let fixture: ComponentFixture<ViewHoliday>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewHoliday],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewHoliday);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
