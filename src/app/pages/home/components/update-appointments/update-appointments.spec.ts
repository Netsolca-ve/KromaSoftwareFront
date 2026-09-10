import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UpdateAppointments } from './update-appointments';

describe('UpdateAppointments', () => {
  let component: UpdateAppointments;
  let fixture: ComponentFixture<UpdateAppointments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateAppointments],
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateAppointments);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
