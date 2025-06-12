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
import {NotificacionesService} from "../Servicios/notificaciones.service";
import {jwtDecode} from "jwt-decode";
import {Notificacion} from "../Modelos/notificacion";
import { CommonModule } from '@angular/common';
import {TemaService} from "../Servicios/tema.service";

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

  // ID del usuario autenticado
  usuarioId: number = 0;

  // Arreglo que almacenará las notificaciones obtenidas
  notificaciones: Notificacion[] = [];

  // Controla si está activado el modo oscuro
  darkMode = false;

  constructor(
    private notificacionesService : NotificacionesService,
    private temaService: TemaService
  ) {
    // Se suscribe al observable para actualizar el modo oscuro dinámicamente
    this.temaService.darkMode$.subscribe(isDark => {
      this.darkMode = isDark;
    });
  }

  ngOnInit() {
    // Se obtiene el ID del usuario desde el token JWT
    this.usuarioId = this.obtenerUsuarioId();
    console.log(this.usuarioId);

    // Si el ID del usuario es válido, se cargan sus notificaciones
    if (this.usuarioId) {
      this.listaNotificaciones();
    } else {
      console.error('No se pudo obtener el ID del usuario.');
    }
  }

  // Obtiene la lista de notificaciones desde el backend
  listaNotificaciones() {
    this.notificacionesService.obtenerNotificacionesPorUsuario(this.usuarioId).subscribe({
      next: (notis: Notificacion[]) => {
        this.notificaciones = notis;
        console.log(this.notificaciones);
      },
      error: (error) => {
        console.error('Error al obtener las notificaciones', error);
      }
    });
  }

  // Eliminar una notificación por su ID
  eliminarNotificacion(id: number) {
    this.notificacionesService.eliminarNotificacion(id).subscribe({
      next : () => {
        console.log('Notificación eliminada');
        this.listaNotificaciones(); // Se recarga la lista después de eliminar
      },
      error: (error) => {
        console.error('Error al eliminar la notificación', error);
      }
    });
  }

  // Extrae el ID del usuario desde el token almacenado en sessionStorage
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
