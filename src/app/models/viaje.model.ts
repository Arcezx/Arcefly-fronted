export interface Viaje {
  id: number;
  origen: string;
  destino: string;
  fechaSalida: string | Date;
  fechaRegreso?: string | Date | null; // Hacerlo opcional y nullable
  direccion: string; // <--- AÑADIR ESTE CAMPO
  capacidad: number;
  estado: 'PROGRAMADO' | 'REPROGRAMADO' | 'CANCELADO' | 'EMBARCANDO' | 'ATERRIZADO' | 'EN HORA' | 'POR CONFIRMAR' | 'ACTIVO';
  clase: string;
  tipo: string;
  precio?: number; // Añadir si es necesario
  descripcion?: string; // Añadir si es necesario
}