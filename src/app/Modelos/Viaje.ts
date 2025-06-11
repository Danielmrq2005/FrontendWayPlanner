import { Maleta } from './Maletas/maleta';
import {Gastos} from "./gastos";

export interface Viaje {
  id?: number;
  nombre: string;
  fechaInicio: string; // ← CAMBIO AQUÍ
  fechaFin: string;    // ← CAMBIO AQUÍ
  destino: string;
  descripcion: string;
  usuario: {
    id: number;
  };
  maletas?: Maleta[];
  gastos?: Gastos[];
}
