import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Notificacion} from "../Modelos/notificacion";

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {
  private url: string = 'https://wayplanner-b04aebc10d26.herokuapp.com/notificaciones';

  constructor(private http: HttpClient) { }

  obtenerNotificacionesPorUsuario(usuarioId: number): Observable<Notificacion[]> {
    return this.http.get<Notificacion[]>(`${this.url}/listar/${usuarioId}`);
  }

  eliminarNotificacion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/eliminar/${id}`);
  }

  establecerHoraNotificacion(id: number, hora: string): Observable<void> {
    const body = { hora };
    return this.http.put<void>(`https://wayplanner-b04aebc10d26.herokuapp.com/notificaciones/establecer-hora/${id}`, body);
  }

}
