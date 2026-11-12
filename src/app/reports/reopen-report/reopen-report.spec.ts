import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReopenReport } from './reopen-report';

describe('ReopenReport', () => {
  let component: ReopenReport;
  let fixture: ComponentFixture<ReopenReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReopenReport],
    }).compileComponents();

    fixture = TestBed.createComponent(ReopenReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
