import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceIndex } from './service-index';

describe('ServiceIndex', () => {
  let component: ServiceIndex;
  let fixture: ComponentFixture<ServiceIndex>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceIndex],
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceIndex);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
