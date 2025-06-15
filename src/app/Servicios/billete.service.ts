import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Billete} from "../Modelos/Billete";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class BilleteService {

  constructor(private http: HttpClient) { }

  private apiUrl = "https://wayplanner-b04aebc10d26.herokuapp.com/billetes";

  // CRUD Billetes
  // ---------------------------------------
  // Crear un billete
  crearBillete(billete: FormData) {
    return this.http.post(`${this.apiUrl}/nuevo_billete`, billete);
  }

  // Actualizar un billete
  actualizarBillete(billeteId: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/actualizar_billete/${billeteId}`, formData);
  }

  // Eliminar billete
  eliminarBillete(billeteId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/eliminar_billete/${billeteId}`);
  }

  // --------------------------------------

  // Obtener grupos de billetes por viaje
  getGruposBilletesPorViaje(viajeId: number) {
    return this.http.get<any>(`${this.apiUrl}/categorias/${viajeId}`);
  }

  // Obtener billetes por categoría y viaje
  getBilletesPorCategoriaYViaje(viajeId: number, categoria: string) {
    return this.http.get<any>(`${this.apiUrl}/viaje/${viajeId}/categoria/${categoria}`);
  }

}
