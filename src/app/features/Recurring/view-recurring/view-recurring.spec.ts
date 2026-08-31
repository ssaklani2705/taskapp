import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewRecurring } from './view-recurring';

describe('ViewRecurring', () => {
  let component: ViewRecurring;
  let fixture: ComponentFixture<ViewRecurring>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewRecurring],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewRecurring);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
