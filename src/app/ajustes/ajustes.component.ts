import { Component, OnInit } from '@angular/core';
import {IonicModule} from "@ionic/angular";
import {Router} from "@angular/router";
import {NotificacionesService} from "../Servicios/notificaciones.service";
import {jwtDecode} from "jwt-decode";
import {UsuarioService} from "../Servicios/usuario.service";
import {PermisosService} from "../Servicios/permisos.service";
import {FormsModule} from "@angular/forms";
import {TemaService} from "../Servicios/tema.service";

@Component({
  selector: 'app-ajustes',
  templateUrl: './ajustes.component.html',
  styleUrls: ['./ajustes.component.scss'],
  standalone: true,
  imports: [
    IonicModule,
    FormsModule
  ]
})
export class AjustesComponent  implements OnInit {
  horaNotificacion: string = '08:00';
  idusuario: number = 0;
  locationEnabled = false;
  storageEnabled = false;
  darkMode = false;



  constructor(
    private router: Router,
    private usuarioService: UsuarioService,
    private permisosService: PermisosService,
    private temaService: TemaService,
    private notificacionesservice: NotificacionesService
  ) {}

  async ngOnInit() {
    this.idusuario = this.obtenerUsuarioId();
    await this.loadPermissionSettings();
    const actualLocationState = await this.permisosService.checkLocationPermission();
    this.locationEnabled = actualLocationState;
    await this.permisosService.savePermissionSettings('location', actualLocationState);
    this.darkMode = this.temaService.isDarkMode();
    this.temaService.darkMode$.subscribe(isDark => {
      this.darkMode = isDark;
    });

    this.cargarHoraNotificacion();

  }

  private async loadPermissionSettings() {
    this.locationEnabled = await this.permisosService.getPermissionSettings('location');
    this.storageEnabled = await this.permisosService.getPermissionSettings('storage');
  }

  async onLocationToggle() {
    try {
      if (!this.locationEnabled) {
        const granted = await this.permisosService.requestLocationPermission();
        this.locationEnabled = granted;
        await this.permisosService.savePermissionSettings('location', granted);
      } else {
        this.locationEnabled = false;
        await this.permisosService.savePermissionSettings('location', false);
      }
    } catch (error) {
      console.error('Error toggling location:', error);
      this.locationEnabled = false;
      await this.permisosService.savePermissionSettings('location', false);
    }
  }


  toggleDarkMode() {
    this.temaService.setDarkMode(this.darkMode);
  }

  async onStorageToggle() {
    const granted = await this.permisosService.requestStoragePermission();
    this.storageEnabled = granted;
    await this.permisosService.savePermissionSettings('storage', granted);
  }


  logout() {
    sessionStorage.removeItem('authToken');
    this.router.navigate(['/home']);
  }


  eliminar() {
    if (this.idusuario) {
      this.usuarioService.eliminarUsuarioporId(this.idusuario).subscribe({
        next: (response) => {
          console.log('Usuario eliminado', response);
          sessionStorage.removeItem('authToken');
          this.router.navigate(['/home']);

        },
        error: (error) => {
          console.error('Error al eliminar el usuario', error);
        }
      });
    }
  }


  // Guardar la hora de notificación en la base de datos
  guardarHoraNotificacion(hora: string) {
    const id = this.obtenerUsuarioId();
    if (!id) return;

    this.notificacionesservice.establecerHoraNotificacion(id, hora).subscribe({
      next: () => console.log('Hora actualizada:', hora),
      error: err => console.error('Error al actualizar la hora', err),
    });
  }
  //cargar la hora de notificación actual del usuario
  private cargarHoraNotificacion() {
    this.usuarioService.obtenerUsuarioPorId(this.idusuario).subscribe({
      next: (usuario) => {
        const hora = usuario?.horaNotificacion;

        if (hora && hora.trim() !== '') {
          this.horaNotificacion = hora.substring(0, 5); // HH:mm
        } else {
          this.horaNotificacion = '08:00';
          console.log('Hora de notificación por defecto asignada:', this.horaNotificacion);

          // 💾 Guardar la hora por defecto en la base de datos
          this.guardarHoraNotificacion(this.horaNotificacion);
        }
      },
      error: (err) => {
        console.error('Error al obtener el usuario:', err);
        this.horaNotificacion = '08:00';
        this.guardarHoraNotificacion(this.horaNotificacion); // Por si también quieres guardar en caso de error
      }
    });
  }






 // obtener la ID del usuario
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
