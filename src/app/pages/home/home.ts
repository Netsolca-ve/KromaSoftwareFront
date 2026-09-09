import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
  effect,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import CalendarJS from '@calendarjs/ce';
import { Appointment, AppointmentStatus, Barber } from '../../@core/interfaces/agenda.model';
import { UiModalService } from '../../@core/services/ui-modal.service';

type CalendarView = 'day' | 'week' | 'month';

// Configuramos el diccionario principal
CalendarJS.setDictionary({
  January: 'Enero',
  February: 'Febrero',
  March: 'Marzo',
  April: 'Abril',
  May: 'Mayo',
  June: 'Junio',
  July: 'Julio',
  August: 'Agosto',
  September: 'Septiembre',
  October: 'Octubre',
  November: 'Noviembre',
  December: 'Diciembre',
  Sunday: 'Domingo',
  Monday: 'Lunes',
  Tuesday: 'Martes',
  Wednesday: 'Miércoles',
  Thursday: 'Jueves',
  Friday: 'Viernes',
  Saturday: 'Sábado',
  Sun: 'Dom',
  Mon: 'Lun',
  Tue: 'Mar',
  Wed: 'Mié',
  Thu: 'Jue',
  Fri: 'Vie',
  Sat: 'Sáb',
});

@Component({
  imports: [CommonModule, FormsModule, MatIconModule],
  selector: 'app-home',
  styleUrl: './home.scss',
  templateUrl: './home.html',
})
export class Home implements AfterViewInit, OnInit, OnDestroy {
  private readonly uiModalService = inject(UiModalService);
  private readonly zone = inject(NgZone);
  @ViewChild('schedule') private scheduleElement?: ElementRef<HTMLElement>;
  @ViewChild('monthCalendar') private monthElement?: ElementRef<HTMLElement>;

  private schedule?: ReturnType<typeof CalendarJS.Schedule>;
  private monthCalendar?: ReturnType<typeof CalendarJS.Calendar>;

  selectedDate = this.toDateInput(new Date());
  barbers: Barber[] = this.createLocalBarbers(this.selectedDate);
  currentTime = '';
  viewMode: CalendarView = 'week';
  searchTerm = '';
  showAppointmentForm = false;
  editingAppointmentId: string | undefined;
  formError = '';
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
    this.updateClock();
    this.clockTimer = window.setInterval(() => this.updateClock(), 1000);
  }

  ngAfterViewInit(): void {
    this.renderSchedule();
  }

  ngOnDestroy(): void {
    if (this.clockTimer) window.clearInterval(this.clockTimer);
  }

  get dateLabel(): string {
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(this.parseDate(this.selectedDate));
  }
  get viewLabel(): string {
    return this.viewMode === 'day'
      ? 'DÍA'
      : this.viewMode === 'month'
        ? 'MES'
        : `SEMANA ${this.weekNumber}`;
  }
  get periodLabel(): string {
    return this.viewMode === 'month'
      ? new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(
          this.parseDate(this.selectedDate),
        )
      : this.dateLabel;
  }
  get weekNumber(): number {
    const date = this.parseDate(this.selectedDate);
    const firstDay = new Date(date.getFullYear(), 0, 1);
    return Math.ceil(
      ((date.getTime() - firstDay.getTime()) / 86400000 + firstDay.getDay() + 1) / 7,
    );
  }

  get filteredBarbers(): Barber[] {
    const term = this.searchTerm.trim().toLowerCase();
    return this.barbers
      .map((barber) => ({
        ...barber,
        appointments: barber.appointments.filter(
          (appointment) =>
            appointment.date === this.selectedDate &&
            (!term ||
              `${appointment.clientName} ${appointment.services}`.toLowerCase().includes(term)),
        ),
      }))
      .filter((barber) => barber.appointments.length > 0 || !term);
  }

  moveDate(days: number): void {
    const date = this.parseDate(this.selectedDate);
    date.setDate(
      date.getDate() + (this.viewMode === 'week' ? days * 7 : this.viewMode === 'month' ? 0 : days),
    );
    if (this.viewMode === 'month') date.setMonth(date.getMonth() + days);
    this.selectedDate = this.toDateInput(date);
    this.renderSchedule();
  }

  goToToday(): void {
    this.selectedDate = this.toDateInput(new Date());
    this.renderSchedule();
  }

  selectView(view: CalendarView): void {
    this.viewMode = view;
    window.setTimeout(() => this.renderSchedule());
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
      barberId: appointment.barberId,
      clientName: appointment.clientName,
      clientPhone: appointment.clientPhone,
      services: appointment.services,
      date: appointment.date,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      price: appointment.price,
      status: appointment.status,
    };
    this.formError = '';
    this.showAppointmentForm = true;
  }

  saveAppointment(): void {
    if (!this.form.clientName.trim() || !this.form.services.trim() || !this.form.barberId) {
      this.formError = 'Completa cliente, servicio y barbero.';
      return;
    }
    const appointment = {
      ...this.form,
      clientName: this.form.clientName.trim(),
      services: this.form.services.trim(),
    };
    const barber = this.barbers.find((item) => item.id === appointment.barberId);
    if (!barber) return;
    if (this.editingAppointmentId) {
      const index = barber.appointments.findIndex((item) => item.id === this.editingAppointmentId);
      if (index >= 0)
        barber.appointments[index] = { ...appointment, id: this.editingAppointmentId };
    } else {
      barber.appointments.push({ ...appointment, id: `local-${Date.now()}` });
    }
    this.showAppointmentForm = false;
    this.renderSchedule();
  }

  statusLabel(status: AppointmentStatus): string {
    const labels: Record<AppointmentStatus, string> = {
      'en-silla': 'En silla',
      confirmado: 'Confirmada',
      completado: 'Completada',
      cancelado: 'Cancelada',
      libre: 'Libre',
    };
    return labels[status];
  }

  loadAgenda(): void {
    this.renderSchedule();
  }

  private updateClock(): void {
    this.currentTime = new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date());
  }

  private emptyForm() {
    return {
      barberId: '',
      clientName: '',
      clientPhone: '',
      services: '',
      date: this.selectedDate,
      startTime: '09:00',
      endTime: '09:45',
      price: 0,
      status: 'confirmado' as AppointmentStatus,
    };
  }

  private openNewAppointmentForSlot(slot: { date?: string; start?: string; end?: string }): void {
    this.editingAppointmentId = undefined;
    this.form = {
      ...this.emptyForm(),
      barberId: this.barbers[0]?.id ?? '',
      date: slot.date ?? this.selectedDate,
      startTime: slot.start ?? '09:00',
      endTime: slot.end ?? '09:45',
    };
    this.formError = '';
    this.showAppointmentForm = true;
  }

  private renderSchedule(): void {
    const element = this.scheduleElement?.nativeElement;
    if (!element) return;

    // Utilizamos 'any' para saltar las restricciones de Typescript
    // y usar propiedades válidas de la librería que no están en sus definiciones
    const options: any = {
      type: this.viewMode === 'day' ? 'day' : 'week',
      value: this.selectedDate,
      data: this.scheduleEvents(),
      grid: 30,
      validRange: ['08:00', '20:00'],

      // Aseguramos el español pasándolo directo a las opciones internas
      months: [
        'Enero',
        'Febrero',
        'Marzo',
        'Abril',
        'Mayo',
        'Junio',
        'Julio',
        'Agosto',
        'Septiembre',
        'Octubre',
        'Noviembre',
        'Diciembre',
      ],
      weekdays: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
      weekdaysShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],

      // 1. INTERCEPTAR LA CREACIÓN DE UNA NUEVA CITA
      // 'oncreate' es el evento REAL de CalendarJS (a diferencia de 'onbeforecreate',
      // que no existe en esta librería y por eso no bloqueaba nada).
      // Se dispara DESPUÉS de que la librería ya creó el bloque "No title",
      // así que lo borramos de inmediato y abrimos nuestro modal en su lugar.
      oncreate: (self: any, events: any[]) => {
        const created = Array.isArray(events) ? events[0] : events;
        if (!created) return;

        // Eliminamos el bloque nativo "No title" que CalendarJS acaba de crear
        self.deleteEvents(created.guid);

        // Abrimos nuestro modal (dentro de la zona de Angular, ya que este
        // callback corre fuera de Zone.js)
        this.zone.run(() =>
          this.openNewAppointmentForSlot({
            date: created.date,
            start: created.start,
            end: created.end,
          }),
        );
      },

      // 2. EDITAR CITA EXISTENTE (doble clic)
      ondblclick: (_self: any, event: any) => {
        this.zone.run(() => {
          const appointment = this.findAppointment(event.guid || event.id);
          if (appointment) this.editAppointment(appointment);
        });
      },
    };

    if (this.viewMode === 'month') {
      if (!this.monthCalendar) {
        const monthElement = this.monthElement?.nativeElement;
        if (!monthElement) return;
        this.monthCalendar = CalendarJS.Calendar(monthElement, {
          type: 'inline',
          value: this.selectedDate,
          footer: false,
          data: this.scheduleEvents().map((event) => ({ date: event.date, title: event.title })),
          onchange: (_self, value) => {
            this.selectedDate = String(value).slice(0, 10);
            this.renderSchedule();
          },
        });
      } else {
        this.monthCalendar.setValue?.(this.selectedDate);
      }
      return;
    }

    if (this.schedule) {
      this.schedule.type = options.type;
      this.schedule.value = this.selectedDate;
      this.schedule.setData(options.data);
      this.schedule.render();
      this.localizeScheduleHeaders();
      return;
    }

    this.schedule = CalendarJS.Schedule(element, options);
    this.localizeScheduleHeaders();
  }

  // Traductor brutal: Fuerza el texto en el DOM
  private localizeScheduleHeaders(): void {
    const weekdays: Record<string, string> = {
      Sun: 'DOM',
      Mon: 'LUN',
      Tue: 'MAR',
      Wed: 'MIÉ',
      Thu: 'JUE',
      Fri: 'VIE',
      Sat: 'SÁB',
      Sunday: 'DOM',
      Monday: 'LUN',
      Tuesday: 'MAR',
      Wednesday: 'MIÉ',
      Thursday: 'JUE',
      Friday: 'VIE',
      Saturday: 'SÁB',
    };

    if (!this.scheduleElement) return;

    // Busca todo texto en el contenedor y lo reemplaza si coincide con un día en inglés
    const headers = this.scheduleElement.nativeElement.querySelectorAll(
      '.lm-schedule-header-weekday, [data-weekday]',
    );

    headers.forEach((header) => {
      const text = header.textContent || '';
      Object.keys(weekdays).forEach((eng) => {
        if (text.includes(eng) || header.getAttribute('data-weekday') === eng) {
          header.textContent = text.replace(eng, weekdays[eng]);
          header.setAttribute('data-weekday', weekdays[eng]);
        }
      });
    });
  }

  private scheduleEvents() {
    return this.barbers.flatMap((barber) =>
      barber.appointments.map((appointment) => ({
        guid: appointment.id,
        title: `${appointment.clientName} - ${appointment.services}`,
        date: appointment.date,
        start: appointment.startTime,
        end: appointment.endTime,
        color: this.appointmentColor(appointment.status),
        description: `${barber.name} · $${appointment.price} USDT`,
      })),
    );
  }

  private findAppointment(id: string): Appointment | undefined {
    return this.barbers
      .flatMap((barber) => barber.appointments)
      .find((appointment) => appointment.id === id);
  }

  private appointmentColor(status: AppointmentStatus): string {
    const colors: Record<AppointmentStatus, string> = {
      'en-silla': '#111827',
      confirmado: '#2764c4',
      completado: '#35b77b',
      cancelado: '#e77979',
      libre: '#aeb7c6',
    };
    return colors[status];
  }

  private createLocalBarbers(date: string): Barber[] {
    return [
      {
        id: 'barber-1',
        name: 'Carlos Medina',
        chairNumber: 1,
        appointments: [
          {
            id: 'local-1',
            date,
            startTime: '09:00',
            endTime: '10:00',
            status: 'confirmado',
            clientName: 'Ricardo Morales',
            clientPhone: '+56 9 5555 1111',
            services: 'Corte de cabello',
            price: 5,
            barberId: 'barber-1',
          },
          {
            id: 'local-2',
            date,
            startTime: '10:00',
            endTime: '11:00',
            status: 'en-silla',
            clientName: 'Gonzalo Valenzuela',
            clientPhone: '+56 9 5555 2222',
            services: 'Corte con barba',
            price: 10,
            barberId: 'barber-1',
          },
        ],
      },
      { id: 'barber-2', name: 'Mateo Rojas', chairNumber: 2, appointments: [] },
    ];
  }

  private toDateInput(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  private parseDate(value: string): Date {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
}
