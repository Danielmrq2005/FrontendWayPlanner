import { Viaje } from './Viaje';

export interface Gastos {
  id: number;
  titulo: string;
  cantidad: number;
  esIngreso: boolean;
  categoria: 'ALOJAMIENTO' | 'COMIDA' | 'TRANSPORTE' | 'OCIO' | 'VARIOS'; // según tu enum
  fecha: Date;
  viaje: Viaje;
}
