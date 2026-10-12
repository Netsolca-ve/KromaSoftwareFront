import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, Observable } from 'rxjs';
import { environments } from '../../../environments/environments';

@Injectable({ providedIn: 'root' })
export class Empleados {
  private http = inject(HttpClient);
  private api = environments.baseUrl ;

  // Signal reactiva para los empleados
  public listaEmpleados = signal<any[]>([]);

  cargarEmpleados(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/empleados`).pipe(
      tap((empleados) => this.listaEmpleados.set(empleados))
    );
  }

  agregarEmpleado(nuevoEmpleado: any): Observable<any> {
    return this.http.post<any>(`${this.api}/empleados`, nuevoEmpleado).pipe(
      tap((empleadoCreado) => {
        this.listaEmpleados.update(actuales => [...actuales, empleadoCreado]);
      })
    );
  }
}