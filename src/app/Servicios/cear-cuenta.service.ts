import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {BehaviorSubject, Observable} from "rxjs";
import {Registro} from "../Modelos/Registro";
@Injectable({
  providedIn: 'root'
})
export class CrearCuentaService {

  private apiUrl = "http://localhost:8080";

  private authState = new BehaviorSubject<boolean>(!!sessionStorage.getItem('authToken'));
  authState$ = this.authState.asObservable();


  constructor(private http: HttpClient) {
  }

  registrar(registro: Registro): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}/auth/registro/perfil`,registro) ;
  }

}
