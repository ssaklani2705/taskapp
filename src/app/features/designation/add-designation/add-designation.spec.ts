import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDesignation } from './add-designation';

describe('AddDesignation', () => {
  let component: AddDesignation;
  let fixture: ComponentFixture<AddDesignation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddDesignation],
    }).compileComponents();

    fixture = TestBed.createComponent(AddDesignation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
