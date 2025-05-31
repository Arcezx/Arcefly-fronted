import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/enviroment.prod' 
import { HttpHeaders } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class ApiService {

constructor(private http: HttpClient) {}

enviarIncidente(data: any): Observable<any> {
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  });
  
  return this.http.post(`${environment.apiBaseUrl}/api/incidentes`, data, {
    headers: headers,
    withCredentials: false  // Cambiado a false si no usas cookies
  });
}
}
