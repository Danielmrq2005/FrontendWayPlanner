import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Notificacion} from "../Modelos/notificacion";

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {
  private url: string = 'http://localhost:8080/notificaciones';

  constructor(private http: HttpClient) { }

  obtenerNotificacionesPorUsuario(usuarioId: number): Observable<Notificacion[]> {
    return this.http.get<Notificacion[]>(`${this.url}/listar/${usuarioId}`);
  }
}
