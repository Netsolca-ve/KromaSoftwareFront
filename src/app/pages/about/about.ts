import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  imports: [CommonModule, FormsModule, MatIconModule],
  selector: 'app-about',
  styleUrl: './about.scss',
  templateUrl: './about.html',
})
export class About {
  name = '';
  chair = 1;
  employees = [
    { name: 'Carlos Medina', role: 'Master Barber', chair: 1, active: true },
    { name: 'Mateo Silva', role: 'Barber', chair: 2, active: true },
    { name: 'Alejandro Paz', role: 'Barber', chair: 3, active: true },
  ];

  addEmployee(): void {
    if (!this.name.trim()) return;
    this.employees.push({ name: this.name.trim(), role: 'Barber', chair: this.chair, active: true });
    this.name = '';
    this.chair++;
  }

  toggleEmployee(employee: { active: boolean }): void { employee.active = !employee.active; }
}
