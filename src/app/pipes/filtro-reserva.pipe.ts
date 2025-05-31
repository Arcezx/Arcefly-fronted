import { Pipe, PipeTransform } from '@angular/core';
import { Reserva } from '../models/reserva.model';

@Pipe({
  name: 'filtroReserva'
})
export class FiltroReservaPipe implements PipeTransform {
  transform(reservas: Reserva[], texto: string, estado: string): Reserva[] {
    if (!reservas) return [];
    
    return reservas.filter(reserva => {
      // Filtro por texto
      const textoMatch = !texto || 
        reserva.idReserva.toString().includes(texto) ||
        reserva.idViaje.toString().includes(texto) ||
        reserva.idUsuario.toString().includes(texto) ||
        reserva.asiento.toLowerCase().includes(texto.toLowerCase());
      
      // Filtro por estado
      const estadoMatch = !estado || reserva.estado === estado;
      
      return textoMatch && estadoMatch;
    });
  }
}