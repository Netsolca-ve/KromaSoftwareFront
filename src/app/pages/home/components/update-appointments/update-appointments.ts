
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteAppointments } from '../confirm-delete-appointments/confirm-delete-appointments';
@Component({
  imports: [CommonModule, FormsModule,MatDialogModule],
  selector: 'app-update-appointments',
  styleUrl: './update-appointments.scss',
  templateUrl: './update-appointments.html',
})
export class UpdateAppointments implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<UpdateAppointments>);
  public readonly data = inject(MAT_DIALOG_DATA);
  private readonly dialog = inject(MatDialog);

  form: any = {};
  formError = '';
  
  barbers = [
    { id: 'barber-1', name: 'Carlos Medina' },
    { id: 'barber-2', name: 'Mateo Rojas' }
  ];

  ngOnInit() {
    const event = this.data.event;
    const startDate = event.start as Date;
    const endDate = event.end as Date;

    const dateStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
    const startTimeStr = startDate.toTimeString().substring(0, 5);
    const endTimeStr = endDate ? endDate.toTimeString().substring(0, 5) : '';

    this.form = {
      id: event.id,
      clientName: event.title.split(' - ')[0] || '',
      services: event.title.split(' - ')[1] || '',
      date: dateStr,
      startTime: startTimeStr,
      endTime: endTimeStr,
      barberId: event.extendedProps?.barberId || this.barbers[0]?.id,
      status: event.extendedProps?.status || 'confirmado',
      price: event.extendedProps?.price || 0
    };
  }

  

  saveAppointment() {
    console.log('Form data before validation:', this.form);
    if (!this.form.clientName.trim() || !this.form.services.trim()) {
      this.formError = 'Completa cliente y servicio.';
      return;
    }
    
    // Cierra el modal enviando un objeto con la acción y los datos
    this.dialogRef.close({ action: 'update', appointment: this.form });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  deleteAppointment() {
    // Aquí cambias "TuComponenteDeConfirmacion" por el nombre real de tu componente
    const confirmRef = this.dialog.open(ConfirmDeleteAppointments, {
      width: '400px',
      panelClass: 'custom-dialog-container',
      // Si tu modal de confirmación necesita datos, pásalos aquí
      data: { message: '¿Estás seguro de que deseas cancelar esta cita?' } 
    });

    confirmRef.afterClosed().subscribe(result => {
      // Si el usuario confirmó la eliminación (asumiendo que tu modal devuelve true)
      if (result) {
        // Cerramos ESTE modal de editar enviando la acción 'delete' al home
        this.dialogRef.close({ action: 'delete', appointment: this.form });
      }
    });
  }
}

