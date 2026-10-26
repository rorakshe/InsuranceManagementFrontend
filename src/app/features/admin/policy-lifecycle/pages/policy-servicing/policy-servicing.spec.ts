import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PolicyServicing } from './policy-servicing';

describe('PolicyServicing', () => {
  let component: PolicyServicing;
  let fixture: ComponentFixture<PolicyServicing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolicyServicing],
    }).compileComponents();

    fixture = TestBed.createComponent(PolicyServicing);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
