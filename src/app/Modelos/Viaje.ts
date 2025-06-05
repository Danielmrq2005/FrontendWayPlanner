import { Maleta } from './Maletas/maleta';
import { Gastos } from './Gastos';

export interface Viaje {
  id?: number;
  nombre: string;
  fechaInicio: Date;
  fechaFin: Date;
  destino: string;
  descripcion: string;
  usuario: {
    id: number;
  };
  maletas?: Maleta[];
  gastos?: Gastos[];
}
