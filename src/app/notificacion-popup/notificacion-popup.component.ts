import { Component, OnInit } from '@angular/core';
import { Notificacion } from '../Modelos/notificacion';
import { NotificacionesService } from '../Servicios/notificaciones.service';
import { jwtDecode } from "jwt-decode";
import { CommonModule } from "@angular/common";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-notificacion-popup',
  templateUrl: './notificacion-popup.component.html',
  styleUrls: ['./notificacion-popup.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class NotificacionPopupComponent implements OnInit {


  notificaciones: Notificacion[] = [];  // Lista de notificaciones visibles

  idsMostrados: Set<number> = new Set(); // IDs ya mostrados para evitar duplicados

  constructor(private notificacionservice: NotificacionesService) {}

  ngOnInit() {
    const usuarioId = this.obtenerUsuarioId();

    setInterval(() => {
      this.notificacionservice.obtenerNotificacionesPorUsuario(usuarioId).subscribe(notis => {
        if (!notis.length) return;

        notis.forEach(notificacion => {
          if (!this.idsMostrados.has(notificacion.id)) {
            this.notificaciones.push(notificacion);
            this.idsMostrados.add(notificacion.id);

            // Elimina la notificación tras 5 segundos
            setTimeout(() => {
              this.notificaciones = this.notificaciones.filter(n => n.id !== notificacion.id);
            }, 5000);
          }
        });
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
