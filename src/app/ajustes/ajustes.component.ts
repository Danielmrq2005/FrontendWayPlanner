import { Component, OnInit } from '@angular/core';
import {IonicModule} from "@ionic/angular";
import {Router} from "@angular/router";
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
  idusuario: number = 0;
  locationEnabled = false;
  storageEnabled = false;
  darkMode = false;


  constructor(
    private router: Router,
    private usuarioService: UsuarioService,
    private permisosService: PermisosService,
    private temaService: TemaService,
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
    this.router.navigate(['/login']);
  }
  obtenerUsuarioId(): number {
    const token = sessionStorage.getItem('authToken');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        return decodedToken.tokenDataDTO?.id || null;
      } catch (error) {
        console.error('Error al decodificar el token', error);
        return 0;
      }
    }
    return 0;
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



}
