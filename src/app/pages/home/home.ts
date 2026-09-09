import { Component, OnDestroy, OnInit, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import {
  Appointment,
  AppointmentStatus,
  Barber,
} from '../../@core/interfaces/agenda.model';
import { LoadingService } from '../../@core/services/loading.service';
import { UiModalService } from '../../@core/services/ui-modal.service';
import { BarberApiService } from '../../@core/services/barber-api.service';
@Component({
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
  ],
  selector: 'app-home',
  styleUrl: './home.scss',
  templateUrl: './home.html',
})


export class Home implements OnInit, OnDestroy {
  private readonly api = inject(BarberApiService);
  private readonly loadingService = inject(LoadingService);
  private readonly uiModalService = inject(UiModalService);

  barbers: Barber[] = [];
  selectedDate = this.toDateInput(new Date());
  currentTime = '';
  searchTerm = '';
  showAppointmentForm = false;
  editingAppointmentId: string | undefined;
  formError = '';
  apiError = '';
  private clockTimer?: number;
  private lastNewAppointmentRequest = 0;

  form = this.emptyForm();

  constructor() {
    effect(() => {
      const request = this.uiModalService.newAppointmentRequested();
      if (request > this.lastNewAppointmentRequest) {
        this.lastNewAppointmentRequest = request;
        this.openNewAppointment();
      }
    });
  }

  ngOnInit(): void {
    this.loadAgenda();
    this.updateClock();
    this.clockTimer = window.setInterval(() => this.updateClock(), 1000);
  }

  ngOnDestroy(): void {
    if (this.clockTimer) window.clearInterval(this.clockTimer);
  }

  get dateLabel(): string {
    return new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).format(this.parseDate(this.selectedDate));
  }

  get weekNumber(): number {
    const date = this.parseDate(this.selectedDate);
    const firstDay = new Date(date.getFullYear(), 0, 1);
    return Math.ceil((((date.getTime() - firstDay.getTime()) / 86400000) + firstDay.getDay() + 1) / 7);
  }

  get filteredBarbers(): Barber[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.barbers;
    return this.barbers.map((barber) => ({
      ...barber,
      appointments: barber.appointments.filter((appointment) => `${appointment.clientName} ${appointment.services}`.toLowerCase().includes(term)),
    }));
  }

  moveDate(days: number): void {
    const date = this.parseDate(this.selectedDate);
    date.setDate(date.getDate() + days);
    this.selectedDate = this.toDateInput(date);
    this.loadAgenda();
  }

  goToToday(): void {
    this.selectedDate = this.toDateInput(new Date());
    this.loadAgenda();
  }

  openNewAppointment(barberId?: string): void {
    this.editingAppointmentId = undefined;
    this.form = { ...this.emptyForm(), barberId: barberId ?? this.barbers[0]?.id ?? '' };
    this.formError = '';
    this.showAppointmentForm = true;
  }

  editAppointment(appointment: Appointment): void {
    this.editingAppointmentId = appointment.id;
    this.form = {
      barberId: appointment.barberId, clientName: appointment.clientName, clientPhone: appointment.clientPhone,
      services: appointment.services, date: appointment.date, startTime: appointment.startTime, endTime: appointment.endTime,
      price: appointment.price, status: appointment.status,
    };
    this.formError = '';
    this.showAppointmentForm = true;
  }

  saveAppointment(): void {
    if (!this.form.clientName.trim() || !this.form.services.trim() || !this.form.barberId) {
      this.formError = 'Completa cliente, servicio y barbero.';
      return;
    }
    this.loadingService.track(this.api.saveAppointment({ ...this.form, clientName: this.form.clientName.trim(), services: this.form.services.trim() }, this.editingAppointmentId)).subscribe(() => {
      this.showAppointmentForm = false;
      this.loadAgenda();
    });
  }

  statusLabel(status: AppointmentStatus): string {
    const labels: Record<AppointmentStatus, string> = { 'en-silla': 'En silla', confirmado: 'Confirmada', completado: 'Completada', cancelado: 'Cancelada', libre: 'Libre' };
    return labels[status];
  }

  loadAgenda(): void {
    this.apiError = '';
    this.loadingService.track(this.api.getBarbers(this.selectedDate)).subscribe({
      next: (barbers) => this.barbers = barbers,
      error: () => this.apiError = 'No se pudo conectar con el backend. Revisa la URL de la API y vuelve a intentarlo.',
    });
  }

  private updateClock(): void {
    this.currentTime = new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date());
  }

  private emptyForm() {
    return { barberId: '', clientName: '', clientPhone: '', services: '', date: this.selectedDate, startTime: '09:00', endTime: '09:45', price: 0, status: 'confirmado' as AppointmentStatus };
  }

  private toDateInput(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  private parseDate(value: string): Date {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
}
