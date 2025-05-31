export interface Admin {
  id_usuario: number;
  nombre: string;
  email: string;
  tipo_usuario: string;
  last_login?: string | null;
  estado?: string;
  created_at?: string;
  password?: string;
  password_plain?: string;
}