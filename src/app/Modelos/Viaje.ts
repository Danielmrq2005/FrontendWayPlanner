import { Maleta } from './Maletas/maleta';
import {Gastos} from "./gastos";

export interface Viaje {
  id?: number;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  destino: string;
  descripcion: string;
  usuario: {
    id: number;
  };
  maletas?: Maleta[];
  gastos?: Gastos[];
}
