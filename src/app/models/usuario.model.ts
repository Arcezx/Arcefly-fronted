export interface Usuario {
  idUsuario: number;
  nombre: string;
  email: string;
  tipoUsuario: string; 
  password?: string; 
}