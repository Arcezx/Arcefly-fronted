import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, catchError, throwError } from 'rxjs';
import { Viaje } from '../models/viaje.model';
import { ViajeBackendResponse } from '../models/viaje-response.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class ViajeService {
  private apiUrl = `${environment.apiBaseUrl}/api/viajes`;
  private viajesUpdatedSource = new Subject<void>();
  
  viajesUpdated$ = this.viajesUpdatedSource.asObservable();

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {}

  notifyViajesUpdated() {
    this.viajesUpdatedSource.next();
  }

  obtenerViajes(): Observable<ViajeBackendResponse[]> {
    return this.http.get<ViajeBackendResponse[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Error obteniendo viajes:', error);
        return throwError(() => error);
      })
    );
  }

  crearViaje(viaje: Viaje): Observable<Viaje> {
    const body = {
      idUsuario: 1,
      origen: viaje.origen,
      destino: viaje.destino,
      fechaSalida: this.formatearFecha(viaje.fechaSalida),
      fechaRegreso: viaje.fechaRegreso ? this.formatearFecha(viaje.fechaRegreso) : null,
      capacidad: viaje.capacidad,
      estado: viaje.estado,
      direccion: viaje.direccion,
      clase: viaje.clase,
      tipo: viaje.tipo,
    };

    return this.http.post<Viaje>(`${this.apiUrl}`, body).pipe(
      tap(() => {
        this.notifyViajesUpdated();
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  private formatearFecha(fecha: string | Date): string | null {
    if (!fecha) return null;
    const date = fecha instanceof Date ? fecha : new Date(fecha);
    if (isNaN(date.getTime())) {
      console.error('Fecha inválida:', fecha);
      return null;
    }
    return date.toISOString().split('T')[0];
  }

  actualizarViaje(id: number, viaje: Viaje): Observable<Viaje> {
    const estadoValidado = viaje.estado.toUpperCase();
    
    const request = {
      idUsuario: 1,
      origen: viaje.origen,
      destino: viaje.destino,
      fechaSalida: this.formatearFecha(viaje.fechaSalida),
      fechaRegreso: viaje.fechaRegreso ? this.formatearFecha(viaje.fechaRegreso) : null,
      capacidad: viaje.capacidad,
      estado: estadoValidado,
      direccion: viaje.fechaRegreso ? 'IDA Y VUELTA' : 'IDA',
      clase: viaje.clase,
      tipo: viaje.tipo
    };

    return this.http.put<Viaje>(`${this.apiUrl}/${id}`, request).pipe(
      tap(() => {
        this.notifyViajesUpdated();
      }),
      catchError(error => {
        console.error('Error completo:', error);
        return throwError(() => error);
      })
    );
  }

  eliminarViaje(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.notifyViajesUpdated();
      }),
      catchError(error => {
        console.error('Error eliminando viaje:', error);
        return throwError(() => error);
      })
    );
  }

  obtenerViajePorId(id: number): Observable<Viaje> {
    return this.http.get<Viaje>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error('Error obteniendo viaje:', error);
        return throwError(() => error);
      })
    );
  }


}