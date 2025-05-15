export interface Gastos {
  id: number;
  titulo: string;
  cantidad: number;
  esIngreso: boolean;
  categoria: string;
  fecha: string;
  viajeId: number;
}
