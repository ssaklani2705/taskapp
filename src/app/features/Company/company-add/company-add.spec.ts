import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyAdd } from './company-add';

describe('CompanyAdd', () => {
  let component: CompanyAdd;
  let fixture: ComponentFixture<CompanyAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyAdd],
    }).compileComponents();

    fixture = TestBed.createComponent(CompanyAdd);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
