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




 loginForm = this.fb.group({

  correo:[ ['', Validators.required, Validators.email]],
  contrasena: [['', Validators.required]],

 })


 onLogin()
{
  if(this.loginForm.valid)
  {
    this.authService.login(this.loginForm.value as any).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error('Login failed:', error);
        this.router.navigate(['/login']);
      },
    })
       
  }
}
  


}
