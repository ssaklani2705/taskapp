import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyView } from './company-view';

describe('CompanyView', () => {
  let component: CompanyView;
  let fixture: ComponentFixture<CompanyView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyView],
    }).compileComponents();

    fixture = TestBed.createComponent(CompanyView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
