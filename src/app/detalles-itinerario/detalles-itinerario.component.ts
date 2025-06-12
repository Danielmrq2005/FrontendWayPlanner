import {Component, Input, OnInit} from '@angular/core';
import {AlertController, IonicModule, ModalController} from "@ionic/angular";
import {NgForOf, NgIf} from "@angular/common";
import {SafeResourceUrl,DomSanitizer} from "@angular/platform-browser";
import {Router} from "@angular/router";
import {ItineariosService} from "../Servicios/itinearios.service";
import {Itinerario} from "../Modelos/Itinerario";

@Component({
  selector: 'app-detalles-itinerario',
  templateUrl: './detalles-itinerario.component.html',
  styleUrls: ['./detalles-itinerario.component.scss'],
  standalone: true,
  imports: [
    IonicModule,
    NgIf,
    NgForOf
  ]
})
export class DetallesItinerarioComponent  implements OnInit {
  // Recibe el itinerario a mostrar como input
  @Input() itinerario: any;
  // Recibe el id del viaje como input
  @Input() idViaje: string | null = null;
  // Recibe el día de la semana como input
  @Input() diaSemana: any;
  // URL segura para el mapa de Google Maps
  mapaUrl: SafeResourceUrl | undefined;

  constructor(private modalCtrl: ModalController, private sanitizer: DomSanitizer, private router: Router, private itinerarioService: ItineariosService, private alertController: AlertController) {}

  // Inicializa el componente y genera la URL del mapa si hay latitud y longitud
  ngOnInit() {
    if (this.itinerario?.latitud && this.itinerario?.longitud) {
      const url = `https://www.google.com/maps?q=${this.itinerario.latitud},${this.itinerario.longitud}&hl=es&z=16&output=embed`;
      this.mapaUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
  }

  // Abre Google Maps con la ruta desde la ubicación actual hasta el destino
  abrirRutaEnGoogleMaps() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const origenLat = position.coords.latitude;
          const origenLng = position.coords.longitude;

          const destinoLat = this.itinerario.latitud;
          const destinoLng = this.itinerario.longitud;

          const url = `https://www.google.com/maps/dir/?api=1&origin=${origenLat},${origenLng}&destination=${destinoLat},${destinoLng}&travelmode=driving`;
          window.open(url, '_blank');
        },
        (error) => {
          console.error('No se pudo obtener la ubicación', error);
          alert('No se pudo obtener tu ubicación actual. Activa el GPS o da permisos.');
        }
      );
    } else {
      alert('La geolocalización no está soportada por tu navegador.');
    }
  }


  // Cierra el modal actual
  cerrar(requiereRecarga: boolean = false) {
    this.modalCtrl.dismiss({ eliminado: requiereRecarga });
  }

  // Navega a la pantalla de actualización de itinerario y cierra el modal
  irAActualizarItinerario() {
    this.router.navigate(['/actu-itinerario'], { state: { itinerario: this.itinerario, idViaje: this.idViaje } });
    this.cerrar()
  }

  // Elimina el itinerario usando el servicio y cierra el modal si tiene éxito
  eliminarItinerario() {
    this.itinerarioService.borrarPorCompleto(this.itinerario.id).subscribe({
      next: () => {
        this.presentAlert('Itinerario eliminado correctamente.');
        this.cerrar(true);
      },
      error: (error) => {
        this.presentAlert(error.message);
      }
    });
  }


  // Filtra los horarios del itinerario por el día de la semana recibido
  filtrarHorariosPorDia(itinerario: Itinerario, diaSemana?: string) {
    return itinerario.horarios.filter(horario => horario.dia === diaSemana);
  }

  presentAlert(mensaje: string) {
    this.alertController.create({
      header: 'Atención',
      message: mensaje,
      buttons: ['OK']
    }).then(alert => alert.present());
  }

}
