import {Component, EventEmitter, HostListener, OnInit, Output} from '@angular/core';
import { UsuarioService } from '../Servicios/usuario.service';
import { ViajeService } from '../Servicios/viaje.service';
import {NavigationEnd, Router, RouterLink} from '@angular/router';
import { mensajeService } from '../Servicios/mensajes.service';
import { ToastController } from '@ionic/angular';



import {
  IonContent, IonFab, IonFabButton,
  IonHeader, IonIcon,
  IonTitle, IonToolbar
} from "@ionic/angular/standalone";
import { jwtDecode } from "jwt-decode";
import { Login } from "../Modelos/Login";
import {Viaje} from "../Modelos/Viaje";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {IonicModule} from "@ionic/angular";
import {TemaService} from "../Servicios/tema.service";

@Component({
  selector: 'app-viajes',
  templateUrl: './viajes.component.html',
  styleUrls: ['./viajes.component.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonTitle,
    IonToolbar,
    NgForOf,
    RouterLink,
    NgClass,
    NgIf,

  ]
})
export class ViajesComponent implements OnInit {
  idusuario: number = 0;
  Nombreusuario: string | undefined = '';
  viajes: Viaje[] = [];
  darkMode = false;



  constructor(private usuarioservice: UsuarioService, private viajeservice: ViajeService, private router: Router, private temaService: TemaService, private mensajeService: mensajeService, private toastController: ToastController) {
    this.temaService.darkMode$.subscribe(isDark => {
      this.darkMode = isDark;
    });

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd && this.router.url === '/viajes') {
        this.cargarViajes(); // Esto vuelve a cargar los viajes
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

  sidebarExpanded = false;

  @Output() expansionChange = new EventEmitter<boolean>();

  toggleSidebar() {
    this.sidebarExpanded = !this.sidebarExpanded;
    this.expansionChange.emit(this.sidebarExpanded);

  }

  NavegaActu() {
    const currentUrl = this.router.url;
    this.router.navigate(['/actu-usuario'], { queryParams: { returnUrl: currentUrl } });
  }

  NavegaAjus() {
    const currentUrl = this.router.url;
    this.router.navigate(['/ajustes'], { queryParams: { returnUrl: currentUrl } });
  }

  ngOnInit() {

    this.mensajeService.mensaje$.subscribe(async mensaje => {
      if (mensaje) {
        await this.mostrarToast(mensaje);
        this.mensajeService.limpiarMensaje();
      }
    });

    this.idusuario = this.obtenerUsuarioId();
    this.cargarViajes();

    if (this.idusuario) {
      this.usuarioservice.obtenerUsuarioId(this.idusuario).subscribe({
        next: (usuario: Login) => {
          this.Nombreusuario = usuario.nombre;
          console.log('Nombre del usuario:', this.Nombreusuario);
        },
        error: (err) => {
          console.error('Error al obtener el usuario:', err);
        }
      });
    }

    this.pantallamMovil();
  }

  async mostrarToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom',
      color: 'success'
    });
    await toast.present();
  }

  cargarViajes() {
    if (this.idusuario) {
      this.viajeservice.listarViajesPorUsuario(this.idusuario).subscribe({
        next: (viajes: Viaje[]) => {
          const hoy = new Date();
          hoy.setHours(0, 0, 0, 0);

          const inicioManana = new Date(hoy);
          inicioManana.setDate(hoy.getDate() + 1);

          viajes.forEach(via => {
            const fechafinViaje = new Date(via.fechaFin);

            if (fechafinViaje <= hoy) {
              this.viajeservice.eliminarViaje(via.id).subscribe({
                next: () => {
                },
                error: (error) => {
                }
              });
            }
          });

          this.viajes = viajes.filter(v => {
            const fechaInicioViaje = new Date(v.fechaInicio);
            return fechaInicioViaje >= hoy;
          });
        },
        error: (err: any) => console.error('Error al obtener los viajes:', err)
      });
    }

    if (this.idusuario) {
      this.usuarioservice.obtenerUsuarioId(this.idusuario).subscribe({
        next: (usuario: Login) => {
          this.Nombreusuario = usuario.nombre;
          console.log('Nombre del usuario:', this.Nombreusuario);
        },
        error: (err) => {
          console.error('Error al obtener el usuario:', err);
        }
      });
    }
  }


  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.pantallamMovil();
  }

  private pantallamMovil() {
    const isMobile = window.innerWidth <= 768;
    if (isMobile && this.sidebarExpanded) {
      this.sidebarExpanded = false;
      this.expansionChange.emit(this.sidebarExpanded);
    }
  }
}
