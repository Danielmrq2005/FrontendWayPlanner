import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Billete} from "../Modelos/Billete";

@Injectable({
  providedIn: 'root'
})
export class BilleteService {

  constructor(private http: HttpClient) { }

  private apiUrl = "http://localhost:8080/billetes";

  crearBillete(billete: FormData) {
    return this.http.post(`${this.apiUrl}/nuevo_billete`, billete);
  }


  // Obtener grupos de billetes por viaje
  getGruposBilletesPorViaje(viajeId: number) {
    return this.http.get<any>(`${this.apiUrl}/categorias/${viajeId}`);
  }

  // Obtener billetes por categoría y viaje
  getBilletesPorCategoriaYViaje(viajeId: number, categoria: string) {
    return this.http.get<any>(`${this.apiUrl}/viaje/${viajeId}/categoria/${categoria}`);
  }
}
