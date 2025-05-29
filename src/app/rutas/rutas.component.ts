import { AfterViewInit, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { IonicModule, IonModal } from "@ionic/angular";
import { addIcons } from "ionicons";
import { add } from "ionicons/icons";
import { FormsModule } from "@angular/forms";
import { OverlayEventDetail } from "@ionic/core/components";
import { NgForOf } from "@angular/common";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { HttpClient } from "@angular/common/http";

import { DiaService } from "../Servicios/dia.service";
import { ItineariosService } from "../Servicios/itinearios.service";
import { Itinerario } from "../Modelos/Itinerario";
import { Dia } from "../Modelos/Dia";
import { DiasItinerario } from "../Modelos/DiasItinerario";

@Component({
  selector: 'app-rutas',
  standalone: true,
  templateUrl: './rutas.component.html',
  styleUrls: ['./rutas.component.scss'],
  imports: [IonicModule, FormsModule, NgForOf, RouterLink]
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

  // Coordenadas Madrid para usar por defecto
  private readonly madridCoords: L.LatLngExpression = [40.4168, -3.7038];

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private itinerarioService: ItineariosService,
    private diaService: DiaService
  ) {
    addIcons({ add });
  }

  ngOnInit() {
    this.idViaje = this.route.snapshot.paramMap.get('id');
    if (this.idViaje) {
      this.obtenerItinerariosEnRuta(this.idViaje);
      this.obtenerDiasPorViaje(parseInt(this.idViaje));
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
      attributionControl: false,
    });

    L.control.attribution({
      position: 'bottomleft'
    }).addTo(this.map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© WayPlanner'
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


        const dia1 = this.dias.find(d => d.numeroDia === 1);
        if (dia1) {
          this.diaSeleccionado = dia1.id;
        }
      },
      error: (err) => {
        console.error('Error al obtener días del viaje:', err);
      }
    });
  }

  onDiaSeleccionado(idDia: number) {
    const diaSel = this.dias.find(d => d.id === idDia);
    if (!diaSel || !this.idViaje) {
      this.clearMarkers();
      this.map.setView(this.madridCoords, 6);  // CENTRAR EN MADRID SI NO HAY DÍA
      return;
    }

    const dto: DiasItinerario = {
      idViaje: parseInt(this.idViaje),
      fecha: diaSel.fecha
    };

    this.obtenerItinerariosPorDia(dto);
  }

  private obtenerItinerariosPorDia(dto: DiasItinerario) {
    this.itinerarioService.obtenerItinerariosPorRutaDia(dto).subscribe({
      next: (response: Itinerario[]) => {
        this.itinerariosDia = response;
        this.plotDayItineraries();
      },
      error: (error) => {
        this.clearMarkers();
        this.map.setView(this.madridCoords, 6);
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
      // Si no hay itinerarios para el día, centramos en Madrid
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
      // Si por alguna razón no hay marcadores válidos, centramos en Madrid
      this.map.setView(this.madridCoords, 6);
    }
  }

  private plotMarkers(itinerarios: Itinerario[]) {
    // Opcional: limpiar marcadores antes
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

  // Modal y otras funciones sin cambios...

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

  eliminarItem(index: number) {

    this.itinerarios.splice(index, 1);


    if (this.markers[index]) {
      this.markers[index].remove();
      this.markers.splice(index, 1);
    }
  }

}
