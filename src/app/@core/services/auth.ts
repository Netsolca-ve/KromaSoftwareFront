import { Injectable, inject} from '@angular/core';
import { environments } from '../../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class Auth {
    private api = environments.baseUrl;
    private http = inject(HttpClient);

    login(credentials: { correo: string; contrasena: string }) {
        return this.http.post(`${this.api}/auth/login`, credentials).pipe(
         tap((response: any) => {
            if(response && response.token) {
                localStorage.setItem('token', response.accessToken);
                localStorage.setItem('usuario', JSON.stringify(response.user));
            }
          })
        );
    }
    
    logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  }

}
