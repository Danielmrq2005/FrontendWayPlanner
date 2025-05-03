import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {BehaviorSubject, Observable} from "rxjs";
import {Registro} from "../Modelos/Registro";
import {VerGastos} from "../Modelos/VerGastos";
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

}
