import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, Observable } from 'rxjs';
import { environments } from '../../../environments/environments';

@Injectable({ providedIn: 'root' })
export class citas {
  private http = inject(HttpClient);
  private api = environments.baseUrl;

  public listaCitas = signal<any[]>([]);

  cargarCitas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/citas`).pipe(
      tap((citas) => this.listaCitas.set(citas))
    );
  }

  agregarCita(nuevaCita: any): Observable<any> {
    return this.http.post<any>(`${this.api}/citas`, nuevaCita).pipe(
      tap(() => {
        // En lugar de anexar manualmente el objeto local, recargamos la lista desde el backend.
        // Hacemos esto porque necesitamos que la base de datos ejecute los JOINs 
        // para traernos los nombres reales del servicio, cliente y barbero.
        this.cargarCitas().subscribe(); 
      })
    );
  }
}