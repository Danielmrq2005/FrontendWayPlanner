import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Viaje} from "../Modelos/Viaje";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ViajeService{
  private baseUrl: string = 'http://localhost:8080/viajes';

  constructor(private http: HttpClient) { }

  listarViajesPorUsuario(usuarioId: number): Observable<Viaje[]> {
    return this.http.get<Viaje[]>(`${this.baseUrl}/listarPorUsuario/${usuarioId}`);
  }

  crearviaje(viaje: Viaje): Observable<Viaje> {
    return this.http.post<Viaje>(`${this.baseUrl}/crear`, viaje);
  }
}
