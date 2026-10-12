import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environments } from '../../../environments/environments';
import { Observable, tap } from 'rxjs';

@Injectable({providedIn: 'root'})
export class Servicios {
    private  http = inject(HttpClient);
    private api = environments.baseUrl;

    public listaServicios= signal<any[]>([]);
    cargarServicios():Observable<any>{
        return this.http.get<any>(`${this.api}/services`).pipe(
            tap((servicios)=>{
                this.listaServicios.set(servicios);
            })
        );
    }
    agregarServicio(nuevoServicio: any): Observable<any> {
    return this.http.post<any>(`${this.api}/services`, nuevoServicio).pipe(
      tap((servicioCreado) => {
        this.listaServicios.update(serviciosActuales => [...serviciosActuales, servicioCreado]);
      })
    );
  }



}
