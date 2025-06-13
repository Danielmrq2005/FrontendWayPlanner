import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class mensajeService {
  private mensajeSubject = new ReplaySubject<string>(1);
  mensaje$ = this.mensajeSubject.asObservable();

  mostrarMensaje(mensaje: string) {
    this.mensajeSubject.next(mensaje);
  }

  limpiarMensaje() {
    this.mensajeSubject.next('');
  }
}
