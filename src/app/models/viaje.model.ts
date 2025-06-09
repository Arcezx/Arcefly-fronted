export interface Viaje {
  id: number;
  origen: string;
  destino: string;
  fechaSalida: string | Date;
  fechaRegreso?: string | Date | null; 
  direccion: string; 
  capacidad: number;
  estado: 'PROGRAMADO' | 'REPROGRAMADO' | 'CANCELADO' | 'EMBARCANDO' | 'ATERRIZADO' | 'EN HORA' | 'POR CONFIRMAR' | 'ACTIVO';
  clase: string;
  tipo: string;
  precio?: number; 
  descripcion?: string; 
}