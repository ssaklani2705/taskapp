import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewIndex } from './view-index';

describe('ViewIndex', () => {
  let component: ViewIndex;
  let fixture: ComponentFixture<ViewIndex>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewIndex],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewIndex);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
