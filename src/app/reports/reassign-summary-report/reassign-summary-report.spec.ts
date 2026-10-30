import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReassignSummaryReport } from './reassign-summary-report';

describe('ReassignSummaryReport', () => {
  let component: ReassignSummaryReport;
  let fixture: ComponentFixture<ReassignSummaryReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReassignSummaryReport],
    }).compileComponents();

    fixture = TestBed.createComponent(ReassignSummaryReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
