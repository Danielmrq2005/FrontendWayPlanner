import {Horario} from "./Horario";

export interface Itinerario {
  id?: number;
  actividad: string;
  latitud: string;
  longitud: string;
  estaEnRuta: boolean;
  apareceEnItinerario: boolean;
  hora: string;
  duracion: string;
  foto: string;
  categoria: string;
  idbillete?: number;
  iddia?: number;
  horarios: Horario[];
}
