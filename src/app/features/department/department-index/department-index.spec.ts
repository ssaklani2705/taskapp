import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmentIndex } from './department-index';

describe('DepartmentIndex', () => {
  let component: DepartmentIndex;
  let fixture: ComponentFixture<DepartmentIndex>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartmentIndex],
    }).compileComponents();

    fixture = TestBed.createComponent(DepartmentIndex);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
