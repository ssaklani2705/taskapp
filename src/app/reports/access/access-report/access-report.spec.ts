import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessReport } from './access-report';

describe('AccessReport', () => {
  let component: AccessReport;
  let fixture: ComponentFixture<AccessReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessReport],
    }).compileComponents();

    fixture = TestBed.createComponent(AccessReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
