import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Login} from "../Modelos/Login";

@Injectable({
  providedIn: 'root'
})
export class UsuarioService{
private baseUrl: string = 'http://localhost:8080/usuario';

constructor(private http: HttpClient) { }

  obtenerUsuarioId(id: number): Observable<Login>{
    return this.http.get<Login>(`${this.baseUrl}/usuarioPorId/${id}`);
  }
}
