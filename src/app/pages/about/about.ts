import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Empleados } from '../../@core/services/empleados';
@Component({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule],
  selector: 'app-about',
  styleUrl: './about.scss',
  templateUrl: './about.html',
})
export class About implements OnInit {
  private fb = inject(FormBuilder);
  public empleadosService = inject(Empleados); // Debe ser public para usar la Signal en el HTML

  empleadoForm!: FormGroup;

  ngOnInit(): void {
    // 1. En tu diseño solo hay un input para el nombre, así que lo iniciamos así. 
    // El cargo "Barber" lo asigna NestJS por defecto gracias a lo que hicimos antes.
    this.empleadoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]]
    });

    // 2. Cargamos los empleados desde MySQL
    this.empleadosService.cargarEmpleados().subscribe({
      error: (err) => console.error('Error al cargar empleados', err)
    });
  }

  onSubmit(): void {
    if (this.empleadoForm.invalid) return;

    // 3. Enviamos los datos al backend
    this.empleadosService.agregarEmpleado(this.empleadoForm.value).subscribe({
      next: () => {
        // Limpiamos el input después de que la Signal actualice la vista sola
        this.empleadoForm.reset();
      },
      error: (err) => console.error('Error al guardar empleado', err)
    });
  }

  // Utilidad para extraer la primera letra del nombre y mostrarla en el avatar (Ej: Carlos -> 'C')
  obtenerInicial(nombre: string): string {
    return nombre ? nombre.charAt(0).toUpperCase() : 'B';
  }
}
