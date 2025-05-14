import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {BehaviorSubject, Observable} from "rxjs";
import {Login} from "../Modelos/Login";

@Injectable({
  providedIn: 'root'
})

export class UsuarioService {

  private apiUrl = 'http://localhost:8080/usuario'

  constructor(private http: HttpClient) {
  }

  private authState = new BehaviorSubject<boolean>(!!sessionStorage.getItem('authToken'));
  authState$ = this.authState.asObservable();


    ActualizarUsuario(id: number, usuario: any): Observable<any> {
      return this.http.put(`${this.apiUrl}/actualizar/${id}`, usuario);
    }

}
