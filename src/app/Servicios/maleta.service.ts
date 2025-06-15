import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Maleta } from '../Modelos/Maletas/maleta';
import { CrearMaletaDTO } from '../Modelos/Maletas/crear-maleta-dto';
import { VerMaletasDTO } from "../Modelos/Maletas/ver-maletas-dto";

@Injectable({
  providedIn: 'root'
})
export class MaletaService {
  private baseUrl = 'https://wayplanner-b04aebc10d26.herokuapp.com/maletas';

  constructor(private http: HttpClient) {}

  // Obtener maletas por viaje
  getMaletasPorViaje(id: number): Observable<Maleta[]> {
    return this.http.get<any>(`${this.baseUrl}/todas_las_maletas/${id}`);
  }

  // Obtener nombre de maleta por ID
  getMaletaPorId(id: number): Observable<Maleta> {
    return this.http.get<any>(`${this.baseUrl}/maleta/${id}`);
  }

  // CRUD Maleta
  // ---------------------------------------
  // Crear una nueva maleta
  crearMaleta(maleta: CrearMaletaDTO): Observable<any> {
    return this.http.post(`${this.baseUrl}/nueva_maleta`, maleta);
  }

  // Actualizar una maleta existente
  actualizarMaleta(id: number, maleta: Maleta): Observable<Maleta[]> {
    return this.http.put<Maleta[]>(`${this.baseUrl}/actualizar_maleta/${id}`, maleta);
  }

  // Eliminar una maleta
  eliminarMaleta(id: number): Observable<Maleta[]> {
    return this.http.delete<Maleta[]>(`${this.baseUrl}/eliminar_maleta/${id}`);
  }
}
