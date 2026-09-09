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
  serviceName = '';
  servicePrice: number | null = null;
  services = [{ name: 'Corte de cabello', duration: 45, price: 5 }, { name: 'Corte con barba', duration: 60, price: 10 }];

  addService(): void { if (this.serviceName.trim() && this.servicePrice) { this.services.push({ name: this.serviceName.trim(), duration: 45, price: this.servicePrice }); this.serviceName = ''; this.servicePrice = null; } }
}
