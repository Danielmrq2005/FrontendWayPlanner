import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {DiasItinerario} from "../Modelos/DiasItinerario";
import {Itinerario} from "../Modelos/Itinerario";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root' // Hace que el servicio esté disponible en toda la app
})
export class ItineariosService {
  private url: string = 'https://wayplanner-b04aebc10d26.herokuapp.com/itinerarios'; // URL base de la API

  constructor(private http: HttpClient) { }

  // Obtiene los itinerarios asociados a un viaje por su ID
  obtenerItinerariosPorViaje(id: number): Observable<Itinerario[]> {
    return this.http.get<any>(`${this.url}/viaje/${id}`);
  }

  // Obtiene los itinerarios asociados a una ruta por su ID
  obtenerItineariosRuta(id:number): Observable<Itinerario[]> {
    return this.http.get<any>(`${this.url}/rutas/${id}`);
  }

  // Obtiene los itinerarios de un día específico
  obtenerItinerariosPorDia(dia: DiasItinerario): Observable<Itinerario[]> {
    return this.http.post<any>(`${this.url}/viaje/dia`,dia);
  }

  // Crea un itinerario con foto usando FormData
  crearItinerarioConFoto(formData: FormData) {
    return this.http.post(`${this.url}/crear`, formData);
  }

  // Obtiene los itinerarios de una ruta en un día específico
  obtenerItinerariosPorRutaDia(dia: DiasItinerario): Observable<Itinerario[]> {
    return this.http.post<any>(`${this.url}/rutas/dias`,dia);
  }

  // Elimina una ruta por su ID
  borrarEnRuta(id?: number): Observable<any> {
    return this.http.delete(`${this.url}/rutas/eliminarRuta/${id}`);
  }

  // Actualiza un itinerario usando FormData
  actualizarItinerario(formData: FormData): Observable<any> {
    return this.http.put<Itinerario>(`${this.url}/actualizar`, formData);
  }

  // Elimina un elemento dentro de un itinerario por su ID
  borrarEnItinerario(id?: number): Observable<any> {
    return this.http.delete(`${this.url}/eliminarEnItinerario/${id}`);
  }

  // Elimina completamente un itinerario por su ID
  borrarPorCompleto(id?: number): Observable<any> {
    return this.http.delete(`${this.url}/eliminar/${id}`);
  }
}
