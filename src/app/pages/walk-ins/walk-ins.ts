import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { CreateWalkIns } from './components/create-walk-ins/create-walk-ins';

@Component({
  imports: [CommonModule, FormsModule, MatIconModule],
  selector: 'app-walk-ins',
  styleUrl: './walk-ins.scss',
  templateUrl: './walk-ins.html',
})
export class WalkIns {
  private dialog = inject(MatDialog);

  abrirModalCita() {
    const dialogRef = this.dialog.open(CreateWalkIns, {
      width: '400px',
      disableClose: true // Evita que se cierre haciendo clic afuera si así lo deseas
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('¡Cita creada con éxito!');
        // Aquí podrías mostrar un pequeño Toast / Snackbar de éxito
      }
    });
  }
}
