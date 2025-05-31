import { Pipe, PipeTransform } from '@angular/core';
import { Viaje } from '../models/viaje.model';

@Pipe({
  name: 'filtroViaje',
  standalone: true
})
export class FiltroViajePipe implements PipeTransform {
  transform(viajes: Viaje[], texto: string, tipo: string): Viaje[] {
    if (!viajes) return [];
    texto = texto.toLowerCase();

    return viajes.filter(v => {
      const coincideTexto = 
        v.origen.toLowerCase().includes(texto) ||
        v.destino.toLowerCase().includes(texto);

      const coincideTipo = tipo ? v.tipo?.toLowerCase() === tipo.toLowerCase() : true;

      return coincideTexto && coincideTipo;
    });
  }
}
