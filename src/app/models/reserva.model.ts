export interface Reserva {
  idReserva: number;
  idViaje: number;
  idUsuario: number;
  fechaReserva: Date;
  asiento: string;
  estado: 'ACTIVA' | 'POR CONFIRMAR' | 'CANCELADA';
}