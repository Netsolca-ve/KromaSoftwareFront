import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Auth } from '../../@core/services/auth';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [MatButtonModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule],
  styleUrl: './edit-user.scss',
  templateUrl: './edit-user.html',
})
export class EditUser implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  readonly currentUser = this.auth.currentUser;
  isSaving = false;
  errorMessage = '';
  successMessage = '';
  editForm!: FormGroup;

  ngOnInit(): void {
    const usuarioActual = this.auth.currentUser();
    this.editForm = this.formBuilder.group({
      nombre: [usuarioActual?.nombre || '', [Validators.required, Validators.maxLength(50)]],
      apellido: [usuarioActual?.apellido || '', [Validators.required, Validators.maxLength(50)]],
      correo: [usuarioActual?.correo || '', [Validators.required, Validators.email]],
      telefono: [usuarioActual?.telefono || '', [Validators.maxLength(20)]],
      contrasena: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]],
    });
  }

  onSubmit() {
    if (this.editForm.invalid) return;
    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';
    const datosActualizados = { ...this.editForm.value };
    if (!datosActualizados.contrasena) {
      delete datosActualizados.contrasena;
    }
    const usuarioActual = this.auth.currentUser();
    if (!usuarioActual || !usuarioActual.id) {
      this.errorMessage = 'No se encontró el ID del usuario.';
      this.isSaving = false;
      return;
    }

    const id = usuarioActual.id; 
    this.auth.actualizarPerfil(id, datosActualizados).subscribe({
      next: () => {
        this.successMessage = 'Perfil actualizado correctamente.';
        this.isSaving = false;
      },
      error: (err) => {
        console.error('Error al actualizar:', err);
        this.errorMessage = 'Ocurrió un error al actualizar los datos.';
        this.isSaving = false;
      }
    });
  }



  cancel() {
    this.router.navigate(['/home']);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

}