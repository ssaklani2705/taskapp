import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReopenSummaryReport } from './reopen-summary-report';

describe('ReopenSummaryReport', () => {
  let component: ReopenSummaryReport;
  let fixture: ComponentFixture<ReopenSummaryReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReopenSummaryReport],
    }).compileComponents();

    fixture = TestBed.createComponent(ReopenSummaryReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
