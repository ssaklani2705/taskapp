import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerLogin } from './manager-login';

describe('ManagerLogin', () => {
  let component: ManagerLogin;
  let fixture: ComponentFixture<ManagerLogin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagerLogin],
    }).compileComponents();

    fixture = TestBed.createComponent(ManagerLogin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
