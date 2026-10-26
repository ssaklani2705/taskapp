import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyIndex } from './company-index';

describe('CompanyIndex', () => {
  let component: CompanyIndex;
  let fixture: ComponentFixture<CompanyIndex>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyIndex],
    }).compileComponents();

    fixture = TestBed.createComponent(CompanyIndex);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
