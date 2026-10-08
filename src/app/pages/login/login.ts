import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldControl, MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { Auth } from '../../@core/services/auth';
import { Validators } from '@angular/forms';
@Component({
  imports: [
    FormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    ReactiveFormsModule
],
  selector: 'app-login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
})
export class Login {
 private fb = inject(FormBuilder);
 private authService = inject(Auth);
 private router = inject(Router);
   confirmPassword = '';
  showPassword = false;
  errorMessage = '';
  rememberSession = false;




 loginForm = this.fb.nonNullable.group({
  correo: ['', [Validators.required, Validators.email]],
  contrasena: ['', Validators.required],
 })


 onLogin()
{
 if (this.loginForm.invalid) {
   this.loginForm.markAllAsTouched();
   return;
 }

 this.errorMessage = '';
 this.authService.logout();

 const credenciales = {
   correo: this.loginForm.controls.correo.value.trim(),
   contrasena: this.loginForm.controls.contrasena.value,
 };

 this.authService.login(credenciales).subscribe({
   next: () => {
     this.router.navigate(['/home']);
   },
   error: (error) => {
     console.error('Login failed:', error);
     this.errorMessage =
       error?.status === 401 || error?.status === 403
         ? 'El correo o la contraseña son incorrectos.'
         : 'No se pudo iniciar sesión. Verifica que el servidor esté disponible.';
   },
 });
}
  


}
