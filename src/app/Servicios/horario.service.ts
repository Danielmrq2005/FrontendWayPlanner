import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Horario} from "../Modelos/Horario";

@Injectable({
  providedIn: 'root' // El servicio estará disponible en toda la app
})
export class HorarioService {

  // URL base de la API para horarios
  private url: string = 'https://wayplanner-b04aebc10d26.herokuapp.com/horario';

  constructor(private http: HttpClient) { }

  // Crea uno o varios horarios enviando un arreglo de objetos Horario
  crearHorario(horario: Horario[]) {
    return this.http.post(`${this.url}/crear`, horario);
  }

  // Actualiza uno o varios horarios enviando un arreglo de objetos Horario
  actualizarHorario(horario: Horario[]) {
    return this.http.put(`${this.url}/actualizar`, horario);
  }

  // Elimina un horario por su ID
  eliminarHorario(id: number) {
    return this.http.delete(`${this.url}/eliminar/${id}`);
  }
}
