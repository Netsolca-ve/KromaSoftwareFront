import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environments } from '../../../environments/environments';

@Injectable({ providedIn: 'root' })
export class RegisterServices {
    private api = environments.baseUrl;
    
    private http = inject(HttpClient);
    
    registerUser(userData: any): Observable<any> {
    return this.http.post<any>(`${this.api}/auth/register`, userData);
  }

  obtenertodoslosuser(): Observable<any> {
    return this.http.get<any>(`${this.api}/users`);
  }


}
