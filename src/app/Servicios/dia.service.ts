import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Dia} from "../Modelos/Dia";

@Injectable({
  providedIn: 'root' // El servicio estará disponible en toda la app
})
export class DiaService {

  constructor(private http: HttpClient) { }

  // URL base de la API para días
  private apiUrl = "https://wayplanner-b04aebc10d26.herokuapp.com/dia";

  // Obtiene los días asociados a un viaje por su ID
  obtenerDias(viajeId: number): Observable<Dia[]> {
    return this.http.get<Dia[]>(`${this.apiUrl}/Obtenerdias/${viajeId}`);
  }

  // Crea un nuevo día enviando un objeto Dia
  crearDia(dia: Dia): Observable<Dia> {
    return this.http.post<Dia>(`${this.apiUrl}/CrearDia`, dia);
  }

  // Elimina un día por su ID
  eliminarDia(id?: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/EliminarDia/${id}`);
  }
}
