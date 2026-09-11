import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

interface ConfirmDeleteData {
  message?: string;
}

@Component({
  imports: [MatDialogModule],
  selector: 'app-confirm-delete-appointments',
  styleUrl: './confirm-delete-appointments.scss',
  templateUrl: './confirm-delete-appointments.html',
})
export class ConfirmDeleteAppointments {
  private readonly dialogRef = inject(MatDialogRef<ConfirmDeleteAppointments>);
  readonly data = inject<ConfirmDeleteData>(MAT_DIALOG_DATA);

  cancel(): void {
    this.dialogRef.close(false);
  }

  confirm(): void {
    this.dialogRef.close(true);
  }
}