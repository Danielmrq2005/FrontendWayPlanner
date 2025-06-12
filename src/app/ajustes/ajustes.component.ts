import { Component, OnInit } from '@angular/core';
import {IonicModule} from "@ionic/angular";
import {Router} from "@angular/router";
import {Notificacion} from "../Modelos/notificacion";
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
export class AjustesComponent implements OnInit {
  horaActual: string = '';
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
    // Obtener el ID del usuario desde el token
    this.idusuario = this.obtenerUsuarioId();

    // Cargar configuración de permisos guardada
    await this.loadPermissionSettings();

    // Comprobar si el permiso de ubicación está activo y guardarlo
    const actualLocationState = await this.permisosService.checkLocationPermission();
    this.locationEnabled = actualLocationState;
    await this.permisosService.savePermissionSettings('location', actualLocationState);

    // Obtener el estado inicial del modo oscuro
    this.darkMode = this.temaService.isDarkMode();

    // Suscribirse a los cambios del modo oscuro
    this.temaService.darkMode$.subscribe(isDark => {
      this.darkMode = isDark;
    });
  }

  private async loadPermissionSettings() {
    // Cargar los permisos de ubicación y almacenamiento desde almacenamiento local
    this.locationEnabled = await this.permisosService.getPermissionSettings('location');
    this.storageEnabled = await this.permisosService.getPermissionSettings('storage');
  }

  async onLocationToggle() {
    try {
      // Si está desactivado, solicitar el permiso
      if (!this.locationEnabled) {
        const granted = await this.permisosService.requestLocationPermission();
        this.locationEnabled = granted;
        await this.permisosService.savePermissionSettings('location', granted);
      } else {
        // Si está activado, desactivarlo y guardar
        this.locationEnabled = false;
        await this.permisosService.savePermissionSettings('location', false);
      }
    } catch (error) {
      // En caso de error, desactivar el permiso
      console.error('Error toggling location:', error);
      this.locationEnabled = false;
      await this.permisosService.savePermissionSettings('location', false);
    }
  }

  // Cambiar el modo oscuro
  toggleDarkMode() {
    this.temaService.setDarkMode(this.darkMode);
  }

  async onStorageToggle() {
    // Solicitar permiso de almacenamiento y guardarlo
    const granted = await this.permisosService.requestStoragePermission();
    this.storageEnabled = granted;
    await this.permisosService.savePermissionSettings('storage', granted);
  }

  // Cerrar sesión y limpiar tema y token
  logout() {
    this.temaService.setDarkMode(false);
    sessionStorage.removeItem('authToken');
    this.router.navigate(['/home']);
  }

  // Eliminar el usuario actual y cerrar sesión
  eliminar() {
    if (this.idusuario) {
      this.usuarioService.eliminarUsuarioporId(this.idusuario).subscribe({
        next: (response) => {
          console.log('Usuario eliminado', response);
          this.temaService.setDarkMode(false);
          sessionStorage.removeItem('authToken');
          this.router.navigate(['/home']);
        },
        error: (error) => {
          console.error('Error al eliminar el usuario', error);
        }
      });
    }
  }

  // Guardar la hora de notificación para el usuario
  guardarHoraNotificacion(hora: string) {
    const id = this.obtenerUsuarioId();
    if (!id) return;

    this.notificacionesservice.establecerHoraNotificacion(id, hora).subscribe({
      next: () => console.log('Hora actualizada:', hora),
      error: err => console.error('Error al actualizar la hora', err),
    });
  }

  // Decodificar el token para obtener el ID del usuario
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
