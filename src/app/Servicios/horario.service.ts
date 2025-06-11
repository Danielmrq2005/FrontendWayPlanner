import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Horario} from "../Modelos/Horario";

@Injectable({
  providedIn: 'root'
})
export class HorarioService {

  private url: string = 'http://localhost:8080/horario';

  constructor(private http: HttpClient) { }

  crearHorario(horario: Horario[]) {
    return this.http.post(`${this.url}/crear`, horario);
  }
}
