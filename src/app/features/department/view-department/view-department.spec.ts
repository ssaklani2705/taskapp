import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDepartment } from './view-department';

describe('ViewDepartment', () => {
  let component: ViewDepartment;
  let fixture: ComponentFixture<ViewDepartment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewDepartment],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewDepartment);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
