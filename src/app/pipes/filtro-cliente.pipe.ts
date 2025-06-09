import { Pipe, PipeTransform } from '@angular/core';
import { Cliente } from '../models/cliente.model';

@Pipe({
  name: 'filtroCliente',
  standalone: true
})
export class FiltroClientePipe implements PipeTransform {
transform(clientes: Cliente[], texto: string, tipo: string): Cliente[] {
  if (!clientes) return [];
  if (!texto && !tipo) return clientes;

  texto = texto.toLowerCase();
  
  return clientes.filter(cliente => {
    const matchesTexto = !texto || 
      cliente.nombre.toLowerCase().includes(texto) || 
      cliente.email.toLowerCase().includes(texto) ||
      (cliente.telefono && cliente.telefono.includes(texto));
    
    const matchesTipo = !tipo || cliente.tipo === tipo;
    
    return matchesTexto && matchesTipo;
  });
}
}