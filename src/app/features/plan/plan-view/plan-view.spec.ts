import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanView } from './plan-view';

describe('PlanView', () => {
  let component: PlanView;
  let fixture: ComponentFixture<PlanView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanView],
    }).compileComponents();

    fixture = TestBed.createComponent(PlanView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
