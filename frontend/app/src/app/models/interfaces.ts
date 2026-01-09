export interface Partner {
  id?: number;
  nombre: string;
  nota?: string;
}

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
  partnerId?: number;
  partnerPercentage?: number;
  partnerCapital?: number;
}

export interface Payment {
  id?: number;
  loan_id: number;
  monto: number;
  fecha: string;
}
