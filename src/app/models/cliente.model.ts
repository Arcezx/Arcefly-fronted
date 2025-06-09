export interface Cliente {
  id: number;
  nombre: string;
  email: string;
  password?: string;
  tipo: 'ESTANDAR' | 'PREMIUM';
  estado: 'ACTIVO' | 'INACTIVO';
  telefono?: string; 
}