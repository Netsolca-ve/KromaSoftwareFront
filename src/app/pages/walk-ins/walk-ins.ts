import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  imports: [CommonModule, FormsModule, MatIconModule],
  selector: 'app-walk-ins',
  styleUrl: './walk-ins.scss',
  templateUrl: './walk-ins.html',
})
export class WalkIns {
  clientName = '';
  service = 'Corte clásico';
  queue = [
    { id: 1, name: 'Nicolás Castro', service: 'Corte Tijera', time: '12:30' },
    { id: 2, name: 'Sebastián Lagos', service: 'Corte Niño Moderno', time: '12:45' },
  ];

  addToQueue(): void {
    if (!this.clientName.trim()) return;
    this.queue.push({ id: Date.now(), name: this.clientName.trim(), service: this.service, time: 'Ahora' });
    this.clientName = '';
  }

  removeFromQueue(id: number): void {
    this.queue = this.queue.filter((client) => client.id !== id);
  }
}
