import { Component, OnInit } from '@angular/core';
import {IonicModule} from "@ionic/angular";
import {Router} from "@angular/router";
import {Notificacion} from "../Modelos/notificacion";
import {NotificacionesService} from "../Servicios/notificaciones.service";
import {jwtDecode} from "jwt-decode";

@Component({
  selector: 'app-ajustes',
  templateUrl: './ajustes.component.html',
  styleUrls: ['./ajustes.component.scss'],
  standalone: true,
  imports: [
    IonicModule
  ]
})
export class AjustesComponent  implements OnInit {
  horaActual: string = '';
  constructor(private router: Router,private notificacionesservice: NotificacionesService) { }

  logout() {
    sessionStorage.removeItem('authToken');
    this.router.navigate(['/login']);
  }

  ngOnInit() {}

  guardarHoraNotificacion(hora: string) {
    const id = this.obtenerUsuarioId();
    if (!id) return;

    this.notificacionesservice.establecerHoraNotificacion(id, hora).subscribe({
      next: () => console.log('Hora actualizada:', hora),
      error: err => console.error('Error al actualizar la hora', err),
    });
  }

  obtenerUsuarioId(): number {
    const token = sessionStorage.getItem('authToken');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        return decoded.tokenDataDTO?.id || 0;
      } catch (e) {
        console.error('Error al decodificar el token', e);
      }
    }
    return 0;
  }
}
