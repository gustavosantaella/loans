export interface Client {
  id?: number;
  nombre: string;
  apellido: string;
  telefono: string;
  correo: string;
  nota: string;
}

export interface Loan {
  id?: number;
  clientId: number;
  fecha: string;
  fechaFin: string;
  monto: number;
  porcentaje: number;
  total: number;
  status: 'pagado' | 'pendiente';
  parentId?: number; // Relación con el préstamo original en caso de corte
}

export interface Payment {
  id?: number;
  loan_id: number;
  monto: number;
  fecha: string;
}
