import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskIndex } from './task-index';

describe('TaskIndex', () => {
  let component: TaskIndex;
  let fixture: ComponentFixture<TaskIndex>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskIndex],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskIndex);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
