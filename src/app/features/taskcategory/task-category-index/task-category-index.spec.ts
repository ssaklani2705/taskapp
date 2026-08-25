import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskCategoryIndex } from './task-category-index';

describe('TaskCategoryIndex', () => {
  let component: TaskCategoryIndex;
  let fixture: ComponentFixture<TaskCategoryIndex>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskCategoryIndex],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskCategoryIndex);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
