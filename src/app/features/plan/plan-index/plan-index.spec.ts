import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StateIndex } from './plan-index';

describe('StateIndex', () => {
  let component: StateIndex;
  let fixture: ComponentFixture<StateIndex>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StateIndex],
    }).compileComponents();

    fixture = TestBed.createComponent(StateIndex);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
