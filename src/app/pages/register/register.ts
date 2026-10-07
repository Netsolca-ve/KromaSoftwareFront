import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  FormGroup,
  FormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldControl, MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { RegisterServices } from '../../@core/services/register-services';
import { RegisterForm } from '../../@core/interfaces/registerFomr';
@Component({
  imports: [
    FormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    ReactiveFormsModule,
  ],
  selector: 'app-register',
  styleUrl: './register.scss',
  templateUrl: './register.html',
})
export class Register {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private registerService = inject(RegisterServices);
  confirmPassword = '';
  showPassword = false;
  errorMessage = '';
  rememberSession = false;

  RegisterForm: FormGroup<RegisterForm> = this.fb.nonNullable.group({
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    telefono: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
    correo: ['', [Validators.required, Validators.email]],
    rol: ['', [Validators.required]],
    contrasena: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(16)]],
    confirmarContraseña: [
      '',
      [Validators.required, Validators.minLength(6), Validators.maxLength(16)],
    ],
  });
  cargarDatos() {
    this.registerService.obtenertodoslosuser().subscribe(
      (response) => {
        console.log('Usuarios obtenidos:', response);
      },
      (error) => {
        console.error('Error al obtener usuarios:', error);
      },
    );
  }

  onsubmit(): void {
    // this.cargarDatos();

    const userData = this.RegisterForm.value;
    if (userData.contrasena !== userData.confirmarContraseña) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }
    this.registerService.registerUser(userData).subscribe(
      (response) => {
        console.log('Usuario registrado:', response);
        this.router.navigate(['/login']);
      },
      (error) => {
        console.error('Error al registrar usuario:', error);
        this.errorMessage = 'Error al registrar usuario. Por favor, inténtalo de nuevo.';
      },
    );
  }
}
