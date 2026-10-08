import { Injectable, inject, signal } from '@angular/core';
import { environments } from '../../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { Observable, map, throwError, tap } from 'rxjs';
import { CurrentUser } from '../interfaces/CurrentUser';
import { LoginResponse } from '../interfaces/login';



@Injectable({ providedIn: 'root' })
export class Auth {
  private api = environments.baseUrl;
  private http = inject(HttpClient);
  readonly currentUser = signal<CurrentUser | null>(null);
  
  constructor() {
    this.cargarUsuarioDesdeStorage();
  }

  actualizarPerfil(id: number, datosNuevos: any): Observable<any> {
    return this.http.patch(`${this.api}/users/${id}`, datosNuevos).pipe(
      tap((usuarioActualizado: any) => {
        this.currentUser.set(usuarioActualizado);
         localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
      })
    );
  }

  login(credenciales: Record<string, string>): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.api}/auth/login`, credenciales).pipe(
      tap((response) => {
        const data = response as LoginResponse & {
          token?: string;
          accessToken?: string;
          user?: CurrentUser;
        };
        const token = data.access_token || data.accessToken || data.token;
        const usuario = data.usuario || data.user;

        if (!token || !usuario) {
          throw new Error('La respuesta de inicio de sesión no tiene los datos esperados.');
        }

        const usuarioNormalizado = this.normalizarUsuario(usuario);
        localStorage.setItem('token', token);
        localStorage.setItem('usuario', JSON.stringify(usuarioNormalizado));
        this.currentUser.set(usuarioNormalizado);
      }),
    );
  }

  updateCurrentUser(
    userData: Pick<CurrentUser, 'nombre' | 'apellido' | 'correo' | 'telefono'>,
  ): Observable<CurrentUser> {
    const user = this.currentUser();

    if (!user) {
      return throwError(() => new Error('No hay un usuario autenticado para actualizar.'));
    }

    return this.http
      .put<CurrentUser | { usuario: CurrentUser } | { datosUsuario: CurrentUser }>(
        `${this.api}/users/${user.id}`,
        userData,
      )
      .pipe(
        tap((response) => {
          const updatedUser = this.normalizarUsuario(response);
          const currentUser = { ...user, ...updatedUser };

          localStorage.setItem('usuario', JSON.stringify(currentUser));
          this.currentUser.set(currentUser);
        }),
        map((response) => this.normalizarUsuario(response)),
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.currentUser.set(null);
  }

  private cargarUsuarioDesdeStorage(): void {
    const userStr = localStorage.getItem('usuario');
    if (!userStr) {
      return;
    }

    try {
      this.currentUser.set(this.normalizarUsuario(JSON.parse(userStr)));
    } catch (error) {
      console.error('No se pudo cargar el usuario guardado:', error);
      localStorage.removeItem('usuario');
    }
  }

  private normalizarUsuario(
    usuario:
      | CurrentUser
      | { usuario: CurrentUser }
      | { datosUsuario: CurrentUser },
  ): CurrentUser {
    if ('usuario' in usuario) {
      return usuario.usuario;
    }

    if ('datosUsuario' in usuario) {
      return usuario.datosUsuario;
    }

    return usuario;
  }
}
