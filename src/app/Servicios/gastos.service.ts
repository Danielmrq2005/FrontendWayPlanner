import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {BehaviorSubject, Observable} from "rxjs";
import {Registro} from "../Modelos/Registro";
import {VerGastos} from "../Modelos/VerGastos";
import {Gastos} from "../Modelos/Gastos";
@Injectable({
  providedIn: 'root'
})
export class GastosService {

  private apiUrl = "http://localhost:8080/gastos";


  constructor(private http: HttpClient) {
  }

  obtenerDiasConGastos(viajeId: number): Observable<VerGastos[]> {
    return this.http.get<VerGastos[]>(`${this.apiUrl}/dias/${viajeId}`);
  }

  crearGasto(gasto: any): Observable<any> {
    console.log(gasto);
    return this.http.post<any>(`${this.apiUrl}/crear`, gasto);
  }

  actualizarGasto(id: number, gasto: Gastos): Observable<any> {
    return this.http.put(`${this.apiUrl}/actualizar/${id}`, gasto);
  }

  getResumenGastos(viajeId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/resumen/${viajeId}`);
  }

  eliminarGasto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/eliminar/${id}`);
  }

}
