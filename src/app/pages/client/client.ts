import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  imports: [CommonModule, FormsModule, MatIconModule],
  selector: 'app-client',
  styleUrl: './client.scss',
  templateUrl: './client.html',
})
export class Client {
  clientName = '';
  clientPhone = '';
  clients = [{ name: 'Ricardo Morales', phone: '+56 9 5555 1111', visits: 8 }, { name: 'Gonzalo Valenzuela', phone: '+56 9 5555 2222', visits: 4 }];

  addClient(): void { if (this.clientName.trim()) { this.clients.push({ name: this.clientName.trim(), phone: this.clientPhone || 'Sin teléfono', visits: 0 }); this.clientName = ''; this.clientPhone = ''; } }
}
