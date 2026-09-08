import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldControl, MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';

@Component({
  imports: [
    FormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule, 
  ],
  selector: 'app-login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
})
export class Login {
  email = '';
  password = '';
  showPassword = false;
  errorMessage = '';
  rememberSession = false;

  constructor(private router: Router) {
    this.email = localStorage.getItem('rememberedEmail') ?? '';
    this.rememberSession =
      localStorage.getItem('rememberSession') === 'true';
  }

  login(): void {
    this.errorMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = 'Completa tu correo y contraseña.';
      return;
    }

    if (
      this.email === 'admin@kromasoft.com' &&
      this.password === '123456'
    ) {
      if (this.rememberSession) {
        localStorage.setItem('rememberedEmail', this.email);
        localStorage.setItem('rememberSession', 'true');
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberSession');
      }

      this.router.navigate(['/home']);
      return;
    }

    this.errorMessage = 'El correo o la contraseña son incorrectos.';
  }
}
