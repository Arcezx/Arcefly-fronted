import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

interface LoginResponse {
  success: boolean;
  message?: string;
  user?: {
    idUsuario: number;
    nombre: string;
    email: string;
    tipoUsuario: string;
    last_login?: string;
  };
}

interface Usuario {
  id_usuario: number;
  nombre: string;
  email: string;
  tipo_usuario: string;
  last_login?: string;
  created_at?: string;
  verified?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  get isAuthenticated(): boolean {
    return !!sessionStorage.getItem('user');
  }

  login(credentials: { email: string, password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        if (response.success && response.user) {
          sessionStorage.setItem('user', JSON.stringify(response.user));
        }
      })
    );
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated;
  }

 

  logout(): void {
    sessionStorage.removeItem('user');
  }
  
 
}