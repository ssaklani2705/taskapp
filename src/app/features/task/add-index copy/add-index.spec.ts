import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddIndex } from './add-index';

describe('AddIndex', () => {
  let component: AddIndex;
  let fixture: ComponentFixture<AddIndex>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddIndex],
    }).compileComponents();

    fixture = TestBed.createComponent(AddIndex);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
