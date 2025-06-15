import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {BehaviorSubject, Observable} from "rxjs";
import {Login} from "../Modelos/Login";

@Injectable({
  providedIn: 'root'
})

export class LoginService {

  private apiUrl = 'https://wayplanner-b04aebc10d26.herokuapp.com'

  private authState = new BehaviorSubject<boolean>(!!sessionStorage.getItem('authToken'));
  authState$ = this.authState.asObservable();



  constructor(private http: HttpClient) {
  }
  setAuthState(isAuthenticated: boolean): void {
    this.authState.next(isAuthenticated);
  }


  loguear(login: Login): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}/auth/login`,login) ;
  }
  verifyCode(email: string, code: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/auth/verificar?email=${email}&codigo=${code}`,
      {}
    );
  }
  reenviarCodigo(email: string): Observable<string> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.apiUrl}/auth/reenviar-codigo`, null, {
      headers,
      params: { email },
      responseType: 'text' // Expect a plain text response
    });
  }
}
