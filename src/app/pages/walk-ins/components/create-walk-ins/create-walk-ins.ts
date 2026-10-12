import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Servicios } from '../../../../@core/services/servicios';
import { Empleados } from '../../../../@core/services/empleados';
import { citas } from '../../../../@core/services/citas';

@Component({
  selector: 'create-walk-ins',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatFormFieldModule, 
    MatInputModule, MatSelectModule, MatButtonModule
  ],
  templateUrl: './create-walk-ins.html',
  styleUrl: './create-walk-ins.scss'
})
export class CreateWalkIns  implements OnInit {
  private fb = inject(FormBuilder);
  public dialogRef = inject(MatDialogRef<CreateWalkIns>);
  
  public serviciosService = inject(Servicios);
  public empleadosService = inject(Empleados);
  private citasService = inject(citas);

  citaForm!: FormGroup;

  ngOnInit(): void {
    this.citaForm = this.fb.group({
      servicio_id: ['', Validators.required],
      barbero_id: ['', Validators.required],
      fecha_hora: [this.obtenerFechaActual(), Validators.required] 
    });

    if (this.serviciosService.listaServicios().length === 0) {
      this.serviciosService.cargarServicios().subscribe();
    }
    if (this.empleadosService.listaEmpleados().length === 0) {
      this.empleadosService.cargarEmpleados().subscribe();
    }
  }
  obtenerFechaActual(): string {
    const ahora = new Date();
    // Ajuste rápido para la zona horaria local
    ahora.setMinutes(ahora.getMinutes() - ahora.getTimezoneOffset());
    return ahora.toISOString().slice(0, 19).replace('T', ' ');
  }

  onSubmit(): void {
    if (this.citaForm.valid) {
      this.citasService.agregarCita(this.citaForm.value).subscribe({
        next: () => {
        
          this.dialogRef.close(true); 
        },
        error: (err) => console.error('Error al agendar', err)
      });
    }
  }
}