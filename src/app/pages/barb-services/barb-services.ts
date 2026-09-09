import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  imports: [CommonModule, FormsModule, MatIconModule],
  selector: 'app-barb-services',
  styleUrl: './barb-services.scss',
  templateUrl: './barb-services.html',
})
export class BarbServices {
  tab: 'clients' | 'services' = 'clients';
  clientName = '';
  clientPhone = '';
  serviceName = '';
  servicePrice: number | null = null;
  clients = [{ name: 'Ricardo Morales', phone: '+56 9 5555 1111', visits: 8 }, { name: 'Gonzalo Valenzuela', phone: '+56 9 5555 2222', visits: 4 }];
  services = [{ name: 'Corte clásico', duration: 45, price: 14000 }, { name: 'Corte & Barba', duration: 60, price: 18500 }];

  addClient(): void { if (this.clientName.trim()) { this.clients.push({ name: this.clientName.trim(), phone: this.clientPhone || 'Sin teléfono', visits: 0 }); this.clientName = ''; this.clientPhone = ''; } }
  addService(): void { if (this.serviceName.trim() && this.servicePrice) { this.services.push({ name: this.serviceName.trim(), duration: 45, price: this.servicePrice }); this.serviceName = ''; this.servicePrice = null; } }
}
