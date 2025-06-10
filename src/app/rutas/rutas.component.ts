import { AfterViewInit, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {ActionSheetController, AlertController, IonicModule, IonModal} from "@ionic/angular";
import { addIcons } from "ionicons";
import {add, mapOutline} from "ionicons/icons";
import { FormsModule } from "@angular/forms";
import { OverlayEventDetail } from "@ionic/core/components";
import {NgForOf, NgIf} from "@angular/common";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { HttpClient } from "@angular/common/http";

import { DiaService } from "../Servicios/dia.service";
import { ItineariosService } from "../Servicios/itinearios.service";
import { Itinerario } from "../Modelos/Itinerario";
import { Dia } from "../Modelos/Dia";
import { DiasItinerario } from "../Modelos/DiasItinerario";
import {TemaService} from "../Servicios/tema.service";
import {ViajeService} from "../Servicios/viaje.service";

@Component({
  selector: 'app-rutas',
  standalone: true,
  templateUrl: './rutas.component.html',
  styleUrls: ['./rutas.component.scss'],
  imports: [IonicModule, FormsModule, NgForOf, RouterLink, NgIf]
})
export class RutasComponent implements AfterViewInit {
  @ViewChild(IonModal) modal!: IonModal;
  @Input() puntos: { lat: number, lng: number }[] = [];
  @Output() puntoSeleccionado = new EventEmitter<{ lat: number, lng: number }>();

  private map!: L.Map;
  private markers: L.Marker[] = [];

  message = 'This modal example uses triggers to automatically open a modal when the button is clicked.';
  name!: string;

  idViaje: string | null = null;
  itinerarios: Itinerario[] = [];
  itinerariosDia: Itinerario[] = [];
  dias: Dia[] = [];
  diaSeleccionado: any;
  darkMode = false;
  viajeNombre: string = '';


  private readonly madridCoords: L.LatLngExpression = [40.4168, -3.7038];

  constructor(
    private route: ActivatedRoute,
    private itinerarioService: ItineariosService,
    private diaService: DiaService,
    private actionSheetCtrl: ActionSheetController,
    private temaService: TemaService,
    private viajeService: ViajeService,
    private alertController: AlertController,
  ) {
    addIcons({ add: add, mapa: mapOutline });
    this.temaService.darkMode$.subscribe(isDark => {
      this.darkMode = isDark;
    });
  }

  ngOnInit() {
    this.idViaje = this.route.snapshot.paramMap.get('id');
    if (this.idViaje) {
      this.obtenerItinerariosEnRuta(this.idViaje);
      this.obtenerDiasPorViaje(parseInt(this.idViaje));

      this.viajeService.viajePorId(+this.idViaje).subscribe({
        next: (viaje) => {
          this.viajeNombre = viaje.nombre;
        },
        error: (err) => {
          console.error('Error al obtener el viaje:', err);
          this.viajeNombre = 'Desconocido';
        }
      });



    }
  }

  ngAfterViewInit(): void {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'assets/Logo1SinFondo.png',
      iconUrl: 'assets/Logo1SinFondo.png',
      shadowUrl: '',
      iconSize: [40, 40],
    });

    this.map = L.map('map', {
      center: this.madridCoords,
      zoom: 6,
      minZoom: 5,
      maxZoom: 18,
      attributionControl: false,
    });


    L.control.attribution({
      position: 'bottomleft'
    }).addTo(this.map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© WayPlanner',
      noWrap: true
    }).addTo(this.map);


    this.puntos.forEach(p => {
      const mk = L.marker([p.lat, p.lng]);
      mk.addTo(this.map);
      this.markers.push(mk);
    });

    setTimeout(() => {
      this.map.invalidateSize();
    }, 300);
  }

  obtenerItinerariosEnRuta(idViaje: string) {
    this.itinerarioService.obtenerItineariosRuta(parseInt(idViaje)).subscribe({
      next: (itins) => {
        this.itinerarios = itins;
        this.plotMarkers(this.itinerarios);
      },
      error: (err) => console.error('Error al obtener itinerarios:', err),
    });
  }

  private obtenerDiasPorViaje(idViaje: number) {
    this.diaService.obtenerDias(idViaje).subscribe({
      next: (diasRecibidos) => {
        this.dias = diasRecibidos;
        console.log('Días obtenidos:', this.dias);

        const dia1 = this.dias.find(d => d.id === 0);
        if (dia1) {
          this.diaSeleccionado = dia1.id;
          this.onDiaSeleccionado(dia1.id);
        }
      },
      error: (err) => {
        console.error('Error al obtener días del viaje:', err);
      }
    });
  }



  onDiaSeleccionado(idDia?: number) {
    const diaSel = this.dias.find(d => d.id === idDia);
    if (!diaSel || !this.idViaje) {
      this.clearMarkers();
      this.map.setView(this.madridCoords, 6);
      return;
    }

    const dto: DiasItinerario = {
      idViaje: parseInt(this.idViaje),
      idDia: diaSel.id
    };

    this.obtenerItinerariosPorDia(dto);
  }

  abrirRutaEnGoogleMaps() {
    const puntos = this.itinerariosDia.length > 0 ? this.itinerariosDia : this.itinerarios;

    if (puntos.length === 0) {
      console.warn('No hay puntos para mostrar en Google Maps');
      return;
    }

    // Construye la URL de Google Maps para múltiples paradas
    const origen = `${puntos[0].latitud},${puntos[0].longitud}`;
    const destino = `${puntos[puntos.length - 1].latitud},${puntos[puntos.length - 1].longitud}`;

    const waypoints = puntos.slice(1, -1) // todos menos el primero y último
      .map(p => `${p.latitud},${p.longitud}`)
      .join('|');

    let url = `https://www.google.com/maps/dir/?api=1&origin=${origen}&destination=${destino}`;
    if (waypoints) {
      url += `&waypoints=${waypoints}`;
    }

    window.open(url, '_blank');
  }


  private obtenerItinerariosPorDia(dto: DiasItinerario) {
    this.itinerarioService.obtenerItinerariosPorRutaDia(dto).subscribe({
      next: (response: Itinerario[]) => {
        this.itinerariosDia = response;
        console.log(response);
        this.plotDayItineraries();
        if (this.itinerariosDia.length === 0) {
          this.map.setView(this.madridCoords, 6);
          this.mostrarAlertaSinRutas();
        }
      },
      error: (error) => {
        this.clearMarkers();
        this.map.setView(this.madridCoords, 6);
        console.error('Error al obtener itinerarios por día:', error);
      }
    });
  }

  private clearMarkers() {
    this.markers.forEach(mk => mk.remove());
    this.markers = [];
  }

  private plotDayItineraries() {
    if (!this.map) return;

    this.clearMarkers();

    if (this.itinerariosDia.length === 0) {
      this.map.setView(this.madridCoords, 6);
      return;
    }

    this.itinerariosDia.forEach(it => {
      if (it.latitud && it.longitud) {
        const lat = parseFloat(it.latitud);
        const lng = parseFloat(it.longitud);
        const mk = L.marker([lat, lng])
          .bindPopup(`<strong>${it.actividad}</strong><br/>${it.hora} (${it.duracion})`);
        mk.addTo(this.map);
        this.markers.push(mk);
      }
    });

    if (this.markers.length > 0) {
      const group = new L.FeatureGroup(this.markers);
      this.map.fitBounds(group.getBounds().pad(0.2));
    } else {
      this.map.setView(this.madridCoords, 6);
    }
  }

  private plotMarkers(itinerarios: Itinerario[]) {
    this.clearMarkers();

    itinerarios.forEach(it => {
      if (it.latitud && it.longitud) {
        const lat = parseFloat(it.latitud);
        const lng = parseFloat(it.longitud);
        const mk = L.marker([lat, lng])
          .bindPopup(`<strong>${it.actividad}</strong><br/>${it.hora} (${it.duracion})`);
        mk.addTo(this.map);
        this.markers.push(mk);
      }
    });

    if (this.markers.length > 0) {
      const group = new L.FeatureGroup(this.markers);
      this.map.fitBounds(group.getBounds().pad(0.2));
    } else {
      this.map.setView(this.madridCoords, 6);
    }
  }

  reordenar(event: CustomEvent) {
    const movedItem = this.itinerarios.splice(event.detail.from, 1)[0];
    this.itinerarios.splice(event.detail.to, 0, movedItem);
    event.detail.complete();
  }

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  confirm() {
    this.modal.dismiss(this.name, 'confirm');
  }

  onWillDismiss(event: CustomEvent<OverlayEventDetail>) {
    if (event.detail.role === 'confirm') {
      this.message = `Hello, ${event.detail.data}!`;
    }
  }

  async eliminarItem(index: number) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: '¿Qué deseas hacer?',
      buttons: [
        {
          text: 'Eliminar solo de la ruta',
          icon: 'remove-circle-outline',
          handler: () => {
            const itinerario = this.itinerarios[index];
            // Llama a tu servicio para eliminar el itinerario por completo
            this.itinerarioService.borrarEnRuta(itinerario.id).subscribe({
              next: () => {
                this.itinerarios.splice(index, 1);
                if (this.markers[index]) {
                  this.markers[index].remove();
                  this.markers.splice(index, 1);
                }
              },
              error: (err) => {
                console.error('Error al eliminar itinerario:', err);
              }
            });
          }
        },
        {
          text: 'Eliminar itinerario por completo',
          icon: 'trash-outline',
          role: 'destructive',
          handler: () => {
            const itinerario = this.itinerarios[index];
            // Llama a tu servicio para eliminar el itinerario por completo
            this.itinerarioService.borrarPorCompleto(itinerario.id).subscribe({
              next: () => {
                this.itinerarios.splice(index, 1);
                if (this.markers[index]) {
                  this.markers[index].remove();
                  this.markers.splice(index, 1);
                }
              },
              error: (err) => {
                console.error('Error al eliminar itinerario:', err);
              }
            });
          }
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

  async mostrarAlertaSinRutas() {
    const alert = await this.alertController.create({
      header: 'No hay rutas',
      message: 'No hay rutas disponibles. Por favor, añade rutas para continuar.',
      buttons: ['Aceptar']
    });

    await alert.present();
  }

}
