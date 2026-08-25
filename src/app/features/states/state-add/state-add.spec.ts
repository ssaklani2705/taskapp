import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StateAdd } from './state-add';

describe('StateAdd', () => {
  let component: StateAdd;
  let fixture: ComponentFixture<StateAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StateAdd],
    }).compileComponents();

    fixture = TestBed.createComponent(StateAdd);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
