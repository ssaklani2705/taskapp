import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReassignReport } from './reassign-report';

describe('ReassignReport', () => {
  let component: ReassignReport;
  let fixture: ComponentFixture<ReassignReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReassignReport],
    }).compileComponents();

    fixture = TestBed.createComponent(ReassignReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
