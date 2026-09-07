import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTaskCategory } from './add-task-category';

describe('AddTaskCategory', () => {
  let component: AddTaskCategory;
  let fixture: ComponentFixture<AddTaskCategory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTaskCategory],
    }).compileComponents();

    fixture = TestBed.createComponent(AddTaskCategory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
