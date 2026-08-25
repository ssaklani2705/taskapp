import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTaskCategory } from './view-task-category';

describe('ViewTaskCategory', () => {
  let component: ViewTaskCategory;
  let fixture: ComponentFixture<ViewTaskCategory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewTaskCategory],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewTaskCategory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
