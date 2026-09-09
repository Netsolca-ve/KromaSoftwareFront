import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UiModalService {
  private newAppointmentCounter = signal(0);
  readonly newAppointmentRequested = this.newAppointmentCounter.asReadonly();

  requestNewAppointment(): void {
    this.newAppointmentCounter.update((value) => value + 1);
  }
}
