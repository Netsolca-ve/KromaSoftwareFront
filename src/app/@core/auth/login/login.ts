import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  imports: [FormsModule,MatIconModule],
  selector: 'app-login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
})
export class Login {
  email = '';
  password = '';
  showPassword = false;
  errorMessage = '';
  selectedBranch = '';
  constructor(private router: Router) {}

  login(): void {
    this.errorMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = 'Completa tu correo y contraseña.';
      return;
    }

    if (this.email === 'admin@kromasoft.com' && this.password === '123456') {
      this.router.navigate(['/home']);
      return;
    }

    this.errorMessage = 'El correo o la contraseña son incorrectos.';
  }
}
