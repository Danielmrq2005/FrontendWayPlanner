import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {ListarObjetosMaletasDTO} from "../Modelos/Maletas/Items/ListarObjetosMaletasDTO";
import {ObjetoSeleccionadoDTO} from "../Modelos/Maletas/Items/ObjetoSeleccionadoDTO";
import {MasCantidadObjetoDTO} from "../Modelos/Maletas/Items/MasCantidadObjetoDTO";
import {CrearItemDTO} from "../Modelos/Maletas/Items/CrearItemDTO";

@Injectable({
  providedIn: 'root'
})
export class ItemsMaletaService {
  private baseUrl = 'http://localhost:8080/itemsMaleta';

  constructor(private http: HttpClient) {}

  // Obtener maletas por viaje
  getItemsPorMaleta(id: number): Observable<ListarObjetosMaletasDTO[]> {
    return this.http.get<any[]>(`${this.baseUrl}/todos_los_objetos/${id}`);
  }

  // CRUD Items de maleta
  // ---------------------------------------
  // Crear un item de maleta
  crearItemMaleta(item: CrearItemDTO): Observable<any> {
    return this.http.post(`${this.baseUrl}/nuevo_objeto`, item);
  }

  // Actualizar un item de maleta
  actualizarItemMaleta(id: number, isSelected: boolean): Observable<any> {
    const body = { isSelected }; // Esto corresponde a ObjetoSeleccionadoDTO en Java
    return this.http.put(`${this.baseUrl}/seleccionar_objeto/${id}`, body);
  }

  // Cambiar cantidad
  cambiarCantidad(id: number, cantidad: number): Observable<ListarObjetosMaletasDTO[]> {
    const body: MasCantidadObjetoDTO = { cantidad };
    return this.http.put<ListarObjetosMaletasDTO[]>(`${this.baseUrl}/cambiar_cantidad_objeto/${id}`, body);
  }
}
