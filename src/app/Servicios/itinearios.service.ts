import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {DiasItinerario} from "../Modelos/DiasItinerario";
import {Itinerario} from "../Modelos/Itinerario";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ItineariosService {
  private url: string = 'http://localhost:8080/itinerarios';


  constructor(private http: HttpClient) { }

  obtenerItinerariosPorViaje(id: number): Observable<Itinerario[]> {
    return this.http.get<any>(`${this.url}/viaje/${id}`);
  }

  obtenerItineariosRuta(id:number): Observable<Itinerario[]> {
    return this.http.get<any>(`${this.url}/rutas/${id}`);
  }

  obtenerItinerariosPorDia(dia: DiasItinerario): Observable<Itinerario[]> {
    return this.http.get<any>(`${this.url}/viaje/dia`, {
      params: {
        idViaje: dia.idViaje,
        dia: dia.dia
      }
    });
  }

  crearItinerario(itinerario: Itinerario) {
    return this.http.post<any>(`${this.url}/crear`, itinerario);
  }
}
