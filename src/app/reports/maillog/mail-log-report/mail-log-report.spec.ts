import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MailLogReport } from './mail-log-report';

describe('MailLogReport', () => {
  let component: MailLogReport;
  let fixture: ComponentFixture<MailLogReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MailLogReport],
    }).compileComponents();

    fixture = TestBed.createComponent(MailLogReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
