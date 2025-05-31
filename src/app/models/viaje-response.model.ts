export interface ViajeBackendResponse {
  idViaje: number;
  idUsuario: number;
  origen: string;
  destino: string;
  fechaSalida: string; 
  fechaRegreso: string | null; 
  direccion: string; 
  capacidad: number;
  estado: string;
  clase: string;
  tipo: string;
}