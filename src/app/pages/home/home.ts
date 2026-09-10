import {
  AfterViewInit,
  Component,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
  effect,
  inject,
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FullCalendarModule, FullCalendarComponent } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

// INTERFACES Y SERVICIOS
import { Appointment, AppointmentStatus, Barber } from '../../@core/interfaces/agenda.model';
import { UiModalService } from '../../@core/services/ui-modal.service';

// ⚠️ DESCOMENTAR CUANDO IMPORTES TUS MODALES
/*
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CreateAsignationsComponent } from './ruta/create-asignations.component';
import { UpdateAsignationsComponent } from './ruta/update-asignations.component';
export enum AsignationType { click = 'click', select = 'select' }
*/

type CalendarView = 'day' | 'week' | 'month';

@Component({
  imports: [CommonModule, FormsModule, MatIconModule, FullCalendarModule],
  selector: 'app-home',
  styleUrl: './home.scss',
  templateUrl: './home.html',
  // providers: [DialogService]
})
export class Home implements OnInit, AfterViewInit, OnDestroy {
  // 1. INYECCIÓN DE DEPENDENCIAS (Sin constructor)
  private readonly uiModalService = inject(UiModalService);
  private readonly zone = inject(NgZone);
  // private readonly dialogService = inject(DialogService);

  @ViewChild('calendar') calendarComponent?: FullCalendarComponent;

  // 2. OBSERVABLES PARA LOS EVENTOS DEL CALENDARIO
  private readonly dateClick$ = new Subject<any>();
  private readonly dateSelect$ = new Subject<any>();
  private readonly eventClick$ = new Subject<any>();
  private readonly destroy$ = new Subject<void>();

  ref: any; // o DynamicDialogRef

  selectedDate = this.toDateInput(new Date());
  barbers: Barber[] = this.createLocalBarbers(this.selectedDate);
  currentTime = '';
  viewMode: CalendarView = 'week';
  searchTerm = '';
  private clockTimer?: number;
  private lastNewAppointmentRequest = 0;

  // Effect asignado como propiedad de clase (no requiere constructor)
  private appointmentEffect = effect(() => {
    const request = this.uiModalService.newAppointmentRequested();
    if (request > this.lastNewAppointmentRequest) {
      this.lastNewAppointmentRequest = request;
      // Lógica de nuevo requerimiento desde el header
    }
  });

  // Configuración de FullCalendar
  calendarOptions: CalendarOptions = {
    plugins: [timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    locale: 'es',
    headerToolbar: false,
    allDaySlot: false,
    slotMinTime: '06:00:00',
    slotMaxTime: '22:00:00',
    events: [],
    height: '100%',
    selectable: true,

    // 3. EL CALENDARIO SOLO EMITE A LOS OBSERVABLES
    dateClick: (arg) => this.dateClick$.next(arg),
    select: (arg) => this.dateSelect$.next(arg),
    eventClick: (arg) => this.eventClick$.next(arg),
  };

  ngOnInit(): void {
    this.updateClock();
    this.clockTimer = window.setInterval(() => this.updateClock(), 1000);

    // 4. SUSCRIPCIONES A LOS EVENTOS REACTIVOS
    // Aquí usamos NgZone para asegurar que el modal renderice de inmediato
    this.dateClick$.pipe(takeUntil(this.destroy$)).subscribe((arg) => {
      this.zone.run(() => {
        /* DESCOMENTAR PARA ABRIR MODAL
        this.ref = this.dialogService.open(CreateAsignationsComponent, {
          header: 'Crear Asignación',
          width: '50vw',
          modal: true,
          breakpoints: { '960px': '75vw', '640px': '90vw' },
          styleClass: 'custom-dialog',
          data: { date: arg.date, type: AsignationType.click },
        });
        */
        console.log('Observable dateClick emitido:', arg.dateStr);
      });
    });

    this.dateSelect$.pipe(takeUntil(this.destroy$)).subscribe((arg) => {
      this.zone.run(() => {
        /* DESCOMENTAR PARA ABRIR MODAL
        this.ref = this.dialogService.open(CreateAsignationsComponent, {
          header: 'Crear Asignación',
          width: '50vw',
          modal: true,
          breakpoints: { '960px': '75vw', '640px': '90vw' },
          styleClass: 'custom-dialog',
          data: { start: arg.start, end: arg.end, type: AsignationType.select },
        });
        */
        console.log('Observable dateSelect emitido Rango:', arg.startStr, 'a', arg.endStr);
      });
    });

    this.eventClick$.pipe(takeUntil(this.destroy$)).subscribe((arg) => {
      this.zone.run(() => {
        // /* DESCOMENTAR PARA ABRIR MODAL
        // this.ref = this.dialogService.open(UpdateAsignationsComponent, {
        //   header: 'Actualizar Asignación',
        //   width: '50vw',
        //   modal: true,
        //   breakpoints: { '960px': '75vw', '640px': '90vw' },
        //   styleClass: 'custom-dialog',
        //   data: { event: arg.event },
        // });
        // */
        console.log('Observable eventClick emitido:', arg.event.title);
      });
    });
  }

  ngAfterViewInit(): void {
    this.updateCalendarState();
  }

  ngOnDestroy(): void {
    if (this.clockTimer) window.clearInterval(this.clockTimer);

    // Matamos las suscripciones para evitar fugas de memoria
    this.destroy$.next();
    this.destroy$.complete();

    if (this.ref) {
      this.ref.close();
    }
  }

  // --- NAVEGACIÓN Y CONTROLES ---
  moveDate(days: number): void {
    const date = this.parseDate(this.selectedDate);
    date.setDate(date.getDate() + (this.viewMode === 'week' ? days * 7 : days));
    this.selectedDate = this.toDateInput(date);
    this.updateCalendarState();
  }

  goToToday(): void {
    this.selectedDate = this.toDateInput(new Date());
    this.updateCalendarState();
  }

  selectView(view: CalendarView): void {
    this.viewMode = view;
    this.updateCalendarState();
  }

  loadAgenda(): void {
    this.updateCalendarState();
  }

  // --- LÓGICA DE RENDERIZADO DEL CALENDARIO ---
  private updateCalendarState(): void {
    this.calendarOptions.events = this.scheduleEvents();

    if (this.calendarComponent) {
      const api = this.calendarComponent.getApi();
      api.gotoDate(this.selectedDate);

      const fcView = this.viewMode === 'day' ? 'timeGridDay' : 'timeGridWeek';
      if (api.view.type !== fcView) {
        api.changeView(fcView);
      }
    }
  }

  private scheduleEvents(): any[] {
    return this.barbers.flatMap((barber) =>
      barber.appointments.map((appointment) => ({
        id: appointment.id,
        title: `${appointment.clientName} - ${appointment.services}`,
        start: `${appointment.date}T${appointment.startTime}:00`,
        end: `${appointment.date}T${appointment.endTime}:00`,
        backgroundColor: this.appointmentColor(appointment.status),
        borderColor: this.appointmentColor(appointment.status),
      })),
    );
  }

  // --- HELPERS Y FORMATOS ---
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
  private updateClock(): void {
    this.currentTime = new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date());
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
