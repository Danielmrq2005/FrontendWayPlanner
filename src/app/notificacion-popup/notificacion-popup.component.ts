import { Component, OnInit } from '@angular/core';
import { Notificacion } from '../Modelos/notificacion';
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

  notificacion?: Notificacion;
  visible = false;
  ultimoIdMostrado: number = 0; // ✅ Nuevo: ID de la última notificación mostrada

  constructor(private notificacionservice: NotificacionesService) { }

  ngOnInit() {
    const usuarioId = this.obtenerUsuarioId();

    setInterval(() => {
      this.notificacionservice.obtenerNotificacionesPorUsuario(usuarioId).subscribe(notis => {
        if (notis.length === 0) return;

        const ultima = notis[notis.length - 1];

        if (ultima.id === this.ultimoIdMostrado) return;

        this.ultimoIdMostrado = ultima.id;
        this.notificacion = ultima;
        this.visible = true;

        setTimeout(() => this.visible = false, 5000);
      });
    }, 60000);
  }

  obtenerUsuarioId(): number {
    const token = sessionStorage.getItem('authToken');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        return decodedToken.tokenDataDTO?.id || 0;
      } catch (error) {
        console.error('Error al decodificar el token', error);
      }
    }
    return 0;
  }
}
