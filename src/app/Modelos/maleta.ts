import { Viaje } from './Viaje';

export interface Maleta {
  id: number;
  nombre: string;
  peso: number;
  tipoMaleta: 'MANO' | 'FACTURADA' | 'MOCHILA';
  viaje: Viaje;
}
