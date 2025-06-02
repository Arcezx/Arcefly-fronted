import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/enviroment.prod' 
import { HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class ApiService {

constructor(private http: HttpClient) {}
enviarIncidente(data: any): Observable<any> {
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest' // Ayuda con algunos proxies
  });
  
  return this.http.post(`${environment.apiBaseUrl}/api/incidentes`, data, { 
    headers: headers
  }).pipe(
    catchError(error => {
      console.error('Error completo:', error);
      throw error;
    })
  );
}
}
