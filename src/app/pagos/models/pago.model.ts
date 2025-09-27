export interface Trazabilidad {
  usuario: string;
  fecha: string;
  nota: string;
}
export interface Pago {
  id: string;
  fecha: string; // ISO date or YYYY-MM-DD
  empresa: string;
  areaOperacion?: string;
  rubro?: string;
  tercero: string;
  valorOperacion: number;
  estadoPago: 'PENDIENTE'|'AUTORIZADO'|'PAGADO';
  ingresoOGasto?: 'INGRESO'|'GASTO';
  formaPago?: string;
  tienePresupuesto?: boolean;
  facturaUrl?: string|null;
  soporteUrl?: string|null;
  trazabilidad?: Trazabilidad[];
}