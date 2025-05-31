import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Cliente } from '../models/cliente.model';
 import { environment } from '../../enviroments/enviroment.prod' 
import { HttpHeaders } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private apiUrl = `${environment.apiBaseUrl}/api/clientes`;
  constructor(private http: HttpClient) {}

  obtenerClientes(): Observable<Cliente[]> {
    return this.http.get<ClienteResponse[]>(this.apiUrl).pipe(
      tap(response => console.log('Respuesta del backend:', response)),
      map(response => {
        if (!Array.isArray(response)) {
          throw new Error('La respuesta no es un array válido');
        }
        
        return response.map(item => this.mapearCliente(item));
      }),
      catchError(error => {
        console.error('Error al obtener clientes:', error);
        return throwError(() => new Error('Error al obtener clientes'));
      })
    );
  }

crearCliente(cliente: any): Observable<Cliente> {
  // Asegurarse de que el estado tenga un valor por defecto
  const clienteData = {
    ...cliente,
    estado: cliente.estado || 'ACTIVO'
  };
  return this.http.post<ClienteResponse>(this.apiUrl, clienteData).pipe(
    map(response => this.mapearCliente(response))
  );
}

actualizarCliente(id: number, cliente: any): Observable<Cliente> {
  return this.http.put<ClienteResponse>(`${this.apiUrl}/${id}`, cliente).pipe(
    map(response => this.mapearCliente(response))
  );
}

  eliminarCliente(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error('Error eliminando cliente:', error);
        return throwError(() => new Error('Error al eliminar cliente'));
      })
    );
  }

  private mapearCliente(item: ClienteResponse): Cliente {
    return {
      id: item.id,
      nombre: item.nombre,
      email: item.email,
      tipo: this.validarTipo(item.tipo),
      estado: this.validarEstado(item.estado)
    };
  }

  private validarTipo(tipo: string): 'ESTANDAR' | 'PREMIUM' {
    return tipo === 'PREMIUM' ? 'PREMIUM' : 'ESTANDAR';
  }

  private validarEstado(estado: string | undefined): 'ACTIVO' | 'INACTIVO' {
    return estado === 'INACTIVO' ? 'INACTIVO' : 'ACTIVO';
  }
}

interface ClienteResponse {
  id: number;
  nombre: string;
  email: string;
  tipo: string;
  estado?: string;
}