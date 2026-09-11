import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Appointment, Barber } from '../interfaces/agenda.model';
import { environments } from '../../../environments/environments';

export type AppointmentPayload = Omit<Appointment, 'id'>;

interface ApiEnvelope<T> {
	data: T;
}

@Injectable({ providedIn: 'root' })
export class BarberApiService {
	private readonly appointmentsUrl = `${environments.baseUrl}/appointments`;
	private readonly barbersUrl = `${environments.baseUrl}/barbers`;

	constructor(private readonly http: HttpClient) {}

	getBarbers(date: string): Observable<Barber[]> {
		const params = new HttpParams().set('date', date);
		return this.http.get<Barber[] | ApiEnvelope<Barber[]>>(this.barbersUrl, { params }).pipe(
			map((response) => this.unwrap(response)),
		);
	}

	saveAppointment(payload: AppointmentPayload, appointmentId?: string): Observable<Appointment> {
		const request = appointmentId
			? this.http.put<Appointment | ApiEnvelope<Appointment>>(`${this.appointmentsUrl}/${appointmentId}`, payload)
			: this.http.post<Appointment | ApiEnvelope<Appointment>>(this.appointmentsUrl, payload);
		return request.pipe(map((response) => this.unwrap(response)));
	}

	deleteAppointment(appointmentId: string): Observable<void> {
		return this.http.delete<void>(`${this.appointmentsUrl}/${appointmentId}`);
	}

	private unwrap<T>(response: T | ApiEnvelope<T>): T {
		if (typeof response === 'object' && response !== null && 'data' in response) {
			return (response as ApiEnvelope<T>).data;
		}
		return response as T;
	}
}
