export interface Usuario {
  idUsuario: number;
  nombre: string;
  email: string;
  tipoUsuario: string; // 'ESTANDAR' | 'PREMIUM' | 'ADMIN' etc.
  password?: string; // Opcional, solo para creación/actualización
}