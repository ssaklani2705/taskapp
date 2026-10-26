import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewService } from './view-service';

describe('ViewService', () => {
  let component: ViewService;
  let fixture: ComponentFixture<ViewService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewService],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
