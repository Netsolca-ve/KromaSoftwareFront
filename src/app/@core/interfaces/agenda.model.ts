export type AppointmentStatus = 'en-silla' | 'confirmado' | 'completado' | 'cancelado' | 'libre';

export interface Appointment {
	id: string;
	date: string;
	startTime: string;
	endTime: string;
	status: AppointmentStatus;
	clientName: string;
	clientPhone: string;
	services: string;
	price: number;
	barberId: string;
}

export interface Barber {
	id: string;
	name: string;
	chairNumber: number;
	appointments: Appointment[];
}