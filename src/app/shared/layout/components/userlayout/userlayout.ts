import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../../../@core/services/auth';

@Component({
  imports: [DatePipe, MatIconModule, RouterLink],
  selector: 'app-userlayout',
  styleUrl: './userlayout.scss',
  templateUrl: './userlayout.html',
})
export class Userlayout {
  readonly auth = inject(Auth);
  private readonly router = inject(Router);

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
