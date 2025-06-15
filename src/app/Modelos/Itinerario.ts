import {Horario} from "./Horario";

export interface Itinerario {
  id?: number;
  actividad: string;
  latitud: string;
  longitud: string;
  estaEnRuta: boolean;
  apareceEnItinerario: boolean;
  hora: string;
  medioTransporte: string | null;
  duracion: string | null;
  foto: string;
  categoria: string;
  idbillete?: number;
  iddia?: number;
  horarios: Horario[];
}
