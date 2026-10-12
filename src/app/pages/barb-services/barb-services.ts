import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Servicios } from '../../@core/services/servicios';

@Component({
  imports: [CommonModule, FormsModule, MatIconModule, ReactiveFormsModule],
  selector: 'app-barb-services',
  styleUrl: './barb-services.scss',
  templateUrl: './barb-services.html',
})
export class BarbServices implements OnInit {
  private fb = inject(FormBuilder);
  public serviciosService = inject(Servicios);

  serviciosForm!:  FormGroup;
  ngOnInit(): void {
    this.serviciosForm= this.fb.group({
      nombre: ['', [Validators.required]],
      precio: ['', [Validators.required]],
    })

    console.log('Formulario de servicios inicializado:', this.serviciosForm.value);
    this.serviciosService.cargarServicios().subscribe({
      error: (error) => {
        console.error('Error al cargar los servicios:', error);
      }
    })
    
  }

   onSubmit(): void {

    if(this.serviciosForm.invalid)return;

    this.serviciosService.agregarServicio(this.serviciosForm.value).subscribe({
      next: (response) => {
        console.log('Servicio agregado:', response);
        this.serviciosForm.reset();
      },
      error: (error) => {
        console.error('Error al agregar el servicio:', error);
      }
    })

   }



}
