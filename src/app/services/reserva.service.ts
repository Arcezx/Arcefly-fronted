import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reserva } from '../models/reserva.model';
import { catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private apiUrl = `${environment.apiBaseUrl}/api/reservas`;
  private reservasSubject = new BehaviorSubject<Reserva[]>([]);
  reservas$ = this.reservasSubject.asObservable();

  constructor(private http: HttpClient) {}

  obtenerReservas(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(this.apiUrl).pipe(
      tap(reservas => this.reservasSubject.next(reservas)),
      catchError(error => {
        console.error('Error al obtener reservas:', error);
        return of([]);
      })
    );
  }

  obtenerReservasPorUsuario(idUsuario: number): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.apiUrl}/usuario/${idUsuario}`).pipe(
      tap(reservas => {
        const current = this.reservasSubject.value;
        const updated = current.map(r => 
          r.idUsuario === idUsuario ? reservas.find(nr => nr.idReserva === r.idReserva) || r : r
        );
        this.reservasSubject.next(updated);
      }),
      catchError(error => {
        console.error('Error al obtener reservas por usuario:', error);
        return of([]);
      })
    );
  }

  crearReserva(reserva: Reserva): Observable<Reserva> {
    return this.http.post<Reserva>(this.apiUrl, reserva).pipe(
      tap(nuevaReserva => {
        const current = this.reservasSubject.value;
        this.reservasSubject.next([...current, nuevaReserva]);
      }),
      catchError(error => {
        console.error('Error al crear reserva:', error);
        throw error;
      })
    );
  }

  actualizarReserva(id: number, reserva: Reserva): Observable<Reserva> {
    return this.http.put<Reserva>(`${this.apiUrl}/${id}`, reserva).pipe(
      tap(updatedReserva => {
        const current = this.reservasSubject.value;
        const updated = current.map(r => 
          r.idReserva === id ? updatedReserva : r
        );
        this.reservasSubject.next(updated);
      }),
      catchError(error => {
        console.error('Error al actualizar reserva:', error);
        throw error;
      })
    );
  }

  confirmarReserva(id: number): Observable<Reserva> {
    return this.http.patch<Reserva>(`${this.apiUrl}/${id}/confirmar`, {}).pipe(
      tap(confirmedReserva => {
        const current = this.reservasSubject.value;
        const updated = current.map(r => 
          r.idReserva === id ? confirmedReserva : r
        );
        this.reservasSubject.next(updated);
      }),
      catchError(error => {
        console.error('Error al confirmar reserva:', error);
        throw error;
      })
    );
  }

  cancelarReserva(idReserva: number): Observable<Reserva> {
    return this.http.patch<Reserva>(`${this.apiUrl}/${idReserva}/cancelar`, {}).pipe(
      tap(canceledReserva => {
        const current = this.reservasSubject.value;
        const updated = current.map(r => 
          r.idReserva === idReserva ? canceledReserva : r
        );
        this.reservasSubject.next(updated);
      }),
      catchError(error => {
        console.error('Error al cancelar reserva:', error);
        throw error;
      })
    );
  }

  eliminarReserva(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const current = this.reservasSubject.value;
        const updated = current.filter(r => r.idReserva !== id);
        this.reservasSubject.next(updated);
      }),
      catchError(error => {
        console.error('Error al eliminar reserva:', error);
        throw error;
      })
    );
  }

  verificarAsiento(idViaje: number, asiento: string): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.apiUrl}/validar-asiento?idViaje=${idViaje}&asiento=${asiento}`
    ).pipe(
      catchError(() => of(true)) // En caso de error, considerar como disponible
    );
  }

  existeReservaParaCliente(idViaje: number, idUsuario: number): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.apiUrl}/existe?idViaje=${idViaje}&idUsuario=${idUsuario}`
    ).pipe(
      catchError(() => of(false)) // En caso de error, considerar como no existente
    );
  }
}