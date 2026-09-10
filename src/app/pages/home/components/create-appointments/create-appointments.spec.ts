import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateAppointments } from './create-appointments';

describe('CreateAppointments', () => {
  let component: CreateAppointments;
  let fixture: ComponentFixture<CreateAppointments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateAppointments],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateAppointments);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
