// Importaciones necesarias
import { Component, OnInit } from '@angular/core';
import { Notificacion } from '../Modelos/notificacion'; // Modelo de la notificación
import { NotificacionesService } from '../Servicios/notificaciones.service';
import { jwtDecode } from "jwt-decode";
import { CommonModule } from "@angular/common";

@Component({
  selector: 'app-notificacion-popup',
  templateUrl: './notificacion-popup.component.html',
  styleUrls: ['./notificacion-popup.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class NotificacionPopupComponent implements OnInit {

  notificacion?: Notificacion; // Última notificación recibida
  visible = false;             // Controla si se muestra el popup o no
  ultimoIdMostrado: number = 0; // Guarda el ID de la última notificación mostrada para evitar repeticiones

  constructor(private notificacionservice: NotificacionesService) {}

  ngOnInit() {
    const usuarioId = this.obtenerUsuarioId(); // Se obtiene el ID del usuario desde el token

    // Cada 60 segundos se consulta si hay nuevas notificaciones
    setInterval(() => {
      this.notificacionservice.obtenerNotificacionesPorUsuario(usuarioId).subscribe(notis => {
        if (notis.length === 0) return; // Si no hay notificaciones, no hace nada

        const ultima = notis[notis.length - 1]; // Toma la última notificación de la lista

        // Si no hay notificación previa o es diferente a la actual, se actualiza
        if (!this.notificacion || this.notificacion.id !== ultima.id) {
          this.notificacion = ultima;
          this.visible = true;
          setTimeout(() => this.visible = false, 5000); // Se oculta el popup a los 5 segundos
        }

        // Si ya se mostró esta notificación, no se vuelve a mostrar
        if (ultima.id === this.ultimoIdMostrado) return;

        // Se actualiza el ID mostrado y se muestra el popup
        this.ultimoIdMostrado = ultima.id;
        this.notificacion = ultima;
        this.visible = true;

        setTimeout(() => this.visible = false, 5000); // Oculta el popup nuevamente
      });
    }, 60000); // Intervalo de 60 segundos
  }

  // Extrae el ID del usuario desde el token guardado en sessionStorage
  obtenerUsuarioId(): number {
    const token = sessionStorage.getItem('authToken');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        console.log(decodedToken); // Muestra el token decodificado en consola
        return decodedToken.tokenDataDTO?.id || 0;
      } catch (error) {
        console.error('Error al decodificar el token', error);
      }
    }
    return 0; // Si no hay token o hubo error, retorna 0
  }
}
