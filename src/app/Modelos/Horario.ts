export interface Horario {
  id: number;
  idItinerario: number;
  dia: string;
  horaInicio: string;
  horaFin: string;
  isClosed: boolean;
}
