import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8080/api'; // URL del backend

  constructor(private http: HttpClient) {}

 enviarIncidente(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/incidentes`, data);
  }
}
