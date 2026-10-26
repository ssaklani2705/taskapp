import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RatingReport } from './rating-report';

describe('RatingReport', () => {
  let component: RatingReport;
  let fixture: ComponentFixture<RatingReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RatingReport],
    }).compileComponents();

    fixture = TestBed.createComponent(RatingReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
