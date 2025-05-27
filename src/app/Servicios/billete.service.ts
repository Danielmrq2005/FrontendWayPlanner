import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Billete} from "../Modelos/Billete";

@Injectable({
  providedIn: 'root'
})
export class BilleteService {

  constructor(private http: HttpClient) { }

  private apiUrl = "http://localhost:8080/billetes";

  crearBillete(billete: FormData) {
    return this.http.post(`${this.apiUrl}/nuevo_billete`, billete);
  }

}
