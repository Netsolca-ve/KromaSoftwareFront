import {AfterViewInit,Component,NgZone,OnDestroy,OnInit,ViewChild,inject} from '@angular/core';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { FullCalendarModule, FullCalendarComponent } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AppointmentStatus, Barber } from '../../@core/interfaces/agenda.model';
import { UiModalService } from '../../@core/services/ui-modal.service';
import { CreateAppointments } from './components/create-appointments/create-appointments';
import { UpdateAppointments } from './components/update-appointments/update-appointments';

type CalendarView = 'day' | 'week' | 'month';

@Component({
  imports: [CommonModule, FormsModule, MatIconModule, FullCalendarModule, MatDialogModule],
  selector: 'app-home',
  styleUrl: './home.scss',
  templateUrl: './home.html',
})
export class Home implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('calendar') calendarComponent?: FullCalendarComponent;
  private readonly uiModalService = inject(UiModalService);
  private readonly zone = inject(NgZone);
  private readonly dialog = inject(MatDialog);
  private readonly dateClick$ = new Subject<any>();
  private readonly dateSelect$ = new Subject<any>();
  private readonly eventClick$ = new Subject<any>();
  private readonly destroy$ = new Subject<void>();



  selectedDate = this.toDateInput(new Date());
  private readonly barbersSubject = new BehaviorSubject<Barber[]>(this.createLocalBarbers(this.selectedDate));
  public readonly events$: Observable<any[]> = this.barbersSubject.pipe(
    map(barbers => this.scheduleEvents(barbers))
  );

  currentTime = '';
  viewMode: CalendarView = 'week';
  searchTerm = '';
  private clockTimer?: number;
  private lastNewAppointmentRequest = 0;
  calendarOptions: CalendarOptions = {
    plugins: [timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    locale: 'es',
    headerToolbar: false,
    allDaySlot: false,
    slotMinTime: '06:00:00',
    slotMaxTime: '22:00:00',
    height: '100%',
    selectable: true,

    dateClick: (arg) => this.dateClick$.next(arg),
    select: (arg) => this.dateSelect$.next(arg),
    eventClick: (arg) => this.eventClick$.next(arg),
  };

  ngOnInit(): void {
    this.updateClock();
    this.clockTimer = window.setInterval(() => this.updateClock(), 1000);
    this.dateClick$.pipe(takeUntil(this.destroy$)).subscribe((arg) => {
      this.zone.run(() => {
        const dialogRef = this.dialog.open(CreateAppointments, {
          width: '560px', maxWidth: '95vw', panelClass: 'custom-dialog-container',
          data: { date: arg.dateStr, start: arg.startStr },
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result) this.processDialogResult(result);
        });
      });
    });

    this.dateSelect$.pipe(takeUntil(this.destroy$)).subscribe((arg) => {
      this.zone.run(() => {
        const dialogRef = this.dialog.open(CreateAppointments, {
          width: '560px', maxWidth: '95vw', panelClass: 'custom-dialog-container',
          data: { start: arg.startStr, end: arg.endStr },
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result) this.processDialogResult(result);
        });
      });
    });

    this.eventClick$.pipe(takeUntil(this.destroy$)).subscribe((arg) => {
      this.zone.run(() => {
        const dialogRef = this.dialog.open(UpdateAppointments, {
          width: '560px', maxWidth: '95vw', panelClass: 'custom-dialog-container',
          data: { event: arg.event },
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result) this.processDialogResult(result);
        });
      });
    });
  }

  ngAfterViewInit(): void {
    this.updateCalendarState();
  }

  ngOnDestroy(): void {
    if (this.clockTimer) window.clearInterval(this.clockTimer);
    this.destroy$.next();
    this.destroy$.complete();
  }

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

  private processDialogResult(result: { action: string, appointment: any }): void {
    const currentBarbers = this.barbersSubject.getValue();
    const data = result.appointment;
    const barber = currentBarbers.find(b => b.id === data.barberId);
    if (!barber) return;
    if (result.action === 'create') {
      barber.appointments.push({ ...data, id: `local-${Date.now()}` });
    }
    else if (result.action === 'update') {
      const index = barber.appointments.findIndex(item => item.id === data.id);
      if (index >= 0) {
        barber.appointments[index] = { ...data };
      }
    }
    else if (result.action === 'delete') {
      const index = barber.appointments.findIndex(item => item.id === data.id);
      if (index >= 0) {
        // Sacamos la cita del arreglo
        barber.appointments.splice(index, 1); 
      }
    }

    this.barbersSubject.next([...currentBarbers]);
  }
  private updateCalendarState(): void {
    if (this.calendarComponent) {
      const api = this.calendarComponent.getApi();
      api.gotoDate(this.selectedDate);

      const fcView = this.viewMode === 'day' ? 'timeGridDay' : 'timeGridWeek';
      if (api.view.type !== fcView) {
        api.changeView(fcView);
      }
    }
  }

  private scheduleEvents(barbers: Barber[]): any[] {
    return barbers.flatMap((barber) =>
      barber.appointments.map((appointment) => ({
        id: appointment.id,
        title: `${appointment.clientName} - ${appointment.services}`,
        start: `${appointment.date}T${appointment.startTime}:00`,
        end: `${appointment.date}T${appointment.endTime}:00`,
        backgroundColor: this.appointmentColor(appointment.status),
        borderColor: this.appointmentColor(appointment.status),
        extendedProps: {
          barberId: appointment.barberId,
          status: appointment.status,
          price: appointment.price
        }
      })),
    );
  }

  get dateLabel(): string {
    return new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).format(this.parseDate(this.selectedDate));
  }
  get viewLabel(): string {
    return this.viewMode === 'day' ? 'DÍA' : this.viewMode === 'month' ? 'MES' : `SEMANA ${this.weekNumber}`;
  }
  get periodLabel(): string {
    return this.viewMode === 'month' ? new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(this.parseDate(this.selectedDate)) : this.dateLabel;
  }
  get weekNumber(): number {
    const date = this.parseDate(this.selectedDate);
    const firstDay = new Date(date.getFullYear(), 0, 1);
    return Math.ceil(((date.getTime() - firstDay.getTime()) / 86400000 + firstDay.getDay() + 1) / 7);
  }
  private updateClock(): void {
    this.currentTime = new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date());
  }
  private appointmentColor(status: AppointmentStatus): string {
    const colors: Record<AppointmentStatus, string> = { 'en-silla': '#111827', confirmado: '#2764c4', completado: '#35b77b', cancelado: '#e77979', libre: '#aeb7c6' };
    return colors[status];
  }
  private createLocalBarbers(date: string): Barber[] {
    return [
      {
        id: 'barber-1', name: 'Carlos Medina', chairNumber: 1, appointments: [
          { id: 'local-1', date, startTime: '09:00', endTime: '10:00', status: 'confirmado', clientName: 'Ricardo Morales', clientPhone: '+56 9 5555 1111', services: 'Corte de cabello', price: 5, barberId: 'barber-1' },
          { id: 'local-2', date, startTime: '10:00', endTime: '11:00', status: 'en-silla', clientName: 'Gonzalo Valenzuela', clientPhone: '+56 9 5555 2222', services: 'Corte con barba', price: 10, barberId: 'barber-1' },
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