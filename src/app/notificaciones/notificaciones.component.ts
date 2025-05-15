import { Component, OnInit } from '@angular/core';
import {
  IonBackButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar
} from "@ionic/angular/standalone";
import {DatePipe} from "@angular/common";
import {Router} from "@angular/router";
import {NotificacionesService} from "../Servicios/notificaciones.service";
import {jwtDecode} from "jwt-decode";
import {Notificacion} from "../Modelos/notificacion";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.component.html',
  styleUrls: ['./notificaciones.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    DatePipe,
    IonButtons,
    IonBackButton
  ]
})
export class NotificacionesComponent  implements OnInit {
    usuarioId: number = 0;
    notificaciones: Notificacion[] = [];

  constructor(private notificacionesService : NotificacionesService) { }

  ngOnInit() {
    this.usuarioId = this.obtenerUsuarioId();
    console.log(this.usuarioId);
    if (this.usuarioId) {
      this.listaNotificaciones();
    } else {
      console.error('No se pudo obtener el ID del usuario.');
    }
  }


  listaNotificaciones(){
    this.notificacionesService.obtenerNotificacionesPorUsuario(this.usuarioId).subscribe({
      next:(notis: Notificacion[]) => {
        this.notificaciones = notis;
        console.log(this.notificaciones);
      },
      error: (error) => {
        console.error('Error al obtener las notificaciones', error);
      }
    });
  }
  obtenerUsuarioId(): number {
    const token = sessionStorage.getItem('authToken');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        console.log(decodedToken);
        return decodedToken.tokenDataDTO?.id || 0;
      } catch (error) {
        console.error('Error al decodificar el token', error);
      }
    }
    return 0;
  }
}
