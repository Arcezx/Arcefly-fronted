import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/enviroment.prod' 
import { HttpHeaders } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = `${environment.apiBaseUrl}/api`; // Usa la URL de environment

  constructor(private http: HttpClient) {}

enviarIncidente(data: any): Observable<any> {
  return this.http.post(`${this.baseUrl}/incidentes`, data, {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  });
}
}
