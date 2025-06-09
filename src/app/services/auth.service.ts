import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

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
  private apiUrl = `${environment.apiBaseUrl}/api/auth`;

  constructor(private http: HttpClient) {}

  get currentUser(): Usuario | null {
    const user = sessionStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  get isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  get userRole(): string | null {
    return this.currentUser?.tipo_usuario || null;
  }

  login(credentials: { email: string, password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.success && response.user) {
          const userData: Usuario = {
            id_usuario: response.user.idUsuario,
            nombre: response.user.nombre,
            email: response.user.email,
            tipo_usuario: response.user.tipoUsuario,
            last_login: response.user.last_login
          };
          sessionStorage.setItem('user', JSON.stringify(userData));
        }
      })
    );
  }

  logout(): void {
    sessionStorage.removeItem('user');
  }

  hasRole(role: string): boolean {
    return this.userRole === role;
  }
    isLoggedIn(): boolean {
    return this.isAuthenticated;
  }

}