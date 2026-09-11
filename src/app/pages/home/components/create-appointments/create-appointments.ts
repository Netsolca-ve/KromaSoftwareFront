import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
@Component({
  imports: [CommonModule, FormsModule, MatDialogModule],
  selector: 'app-create-appointments',
  styleUrl: './create-appointments.scss',
  templateUrl: './create-appointments.html',
})
export class CreateAppointments implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<CreateAppointments>);
  public readonly data = inject(MAT_DIALOG_DATA);

  form: any = {};
  formError = '';

  barbers = [
    { id: 'barber-1', name: 'Carlos Medina' },
    { id: 'barber-2', name: 'Mateo Rojas' }
  ];

  ngOnInit() {
    this.form = {
      barberId: this.barbers[0]?.id ?? '',
      clientName: '',
      clientPhone: '',
      services: '',
      date: this.data.date || (this.data.start ? this.data.start.split('T')[0] : ''),
      startTime: this.data.start ? (this.data.start.includes('T') ? this.data.start.split('T')[1].substring(0, 5) : this.data.start) : '09:00',
      endTime: this.data.end ? (this.data.end.includes('T') ? this.data.end.split('T')[1].substring(0, 5) : this.data.end) : '09:45',
      price: 0,
      status: 'confirmado'
    };
  }

  saveAppointment() {
    if (!this.form.clientName.trim() || !this.form.services.trim() || !this.form.barberId) {
      this.formError = 'Completa cliente, servicio y barbero.';
      return;
    }

    this.dialogRef.close({ action: 'create', appointment: this.form });
  }

  closeDialog() {
    this.dialogRef.close(); // Se cierra enviando undefined
  }
}
