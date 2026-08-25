import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DesignationIndex } from './designation-index';

describe('DesignationIndex', () => {
  let component: DesignationIndex;
  let fixture: ComponentFixture<DesignationIndex>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DesignationIndex],
    }).compileComponents();

    fixture = TestBed.createComponent(DesignationIndex);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
