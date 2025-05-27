import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Dia} from "../Modelos/Dia";

@Injectable({
  providedIn: 'root'
})
export class DiaService {

  constructor(private http: HttpClient) { }

  private apiUrl = "http://localhost:8080/dia";

  obtenerDias(viajeId: number): Observable<Dia[]> {
    return this.http.get<Dia[]>(`${this.apiUrl}/Obtenerdias/${viajeId}`);
  }

  crearDia(dia: Dia): Observable<Dia> {
    return this.http.post<Dia>(`${this.apiUrl}/CrearDia`, dia);
  }
}
