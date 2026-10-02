import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';

@Service()
export class RegisterServices {
    private api: string = 'http://localhost:3000/register';
    private http = inject(HttpClient);

    registerUser(userData: any): Observable<any> {
        return this.http.post(this.api, userData);
    }
}
