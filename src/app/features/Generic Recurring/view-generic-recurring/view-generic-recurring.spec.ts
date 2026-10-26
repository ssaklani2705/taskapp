import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewGenericRecurring } from './view-generic-recurring';

describe('ViewGenericRecurring', () => {
  let component: ViewGenericRecurring;
  let fixture: ComponentFixture<ViewGenericRecurring>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewGenericRecurring],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewGenericRecurring);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
