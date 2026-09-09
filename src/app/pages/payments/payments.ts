import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  imports: [CommonModule, FormsModule, MatIconModule],
  selector: 'app-payments',
  styleUrl: './payments.scss',
  templateUrl: './payments.html',
})
export class Payments {
  clientName = '';
  amount: number | null = null;
  method = 'Efectivo';
  payments = [
    { client: 'Ricardo Morales', amount: 18500, method: 'Tarjeta', time: '09:45' },
    { client: 'Gonzalo Valenzuela', amount: 14000, method: 'Efectivo', time: '10:35' },
  ];

  get total(): number { return this.payments.reduce((sum, payment) => sum + payment.amount, 0); }

  registerPayment(): void {
    if (!this.clientName.trim() || !this.amount || this.amount <= 0) return;
    this.payments.unshift({ client: this.clientName.trim(), amount: this.amount, method: this.method, time: 'Ahora' });
    this.clientName = '';
    this.amount = null;
  }
}
