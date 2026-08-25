import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDesignation } from './view-designation';

describe('ViewDesignation', () => {
  let component: ViewDesignation;
  let fixture: ComponentFixture<ViewDesignation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewDesignation],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewDesignation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
