import {AfterViewInit, Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {IonicModule, IonModal} from "@ionic/angular";
import {addIcons} from "ionicons";
import {add} from "ionicons/icons";
import {FormsModule} from "@angular/forms";
import {OverlayEventDetail} from "@ionic/core/components";
import {NgForOf} from "@angular/common";
import {ActivatedRoute, RouterLink} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {DiaService} from "../Servicios/dia.service";
import {ItineariosService} from "../Servicios/itinearios.service";
import {Itinerario} from "../Modelos/Itinerario";
import {Dia} from "../Modelos/Dia";
import {DiasItinerario} from "../Modelos/DiasItinerario";

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
  private marcadorSeleccionado!: L.Marker;
  message = 'This modal example uses triggers to automatically open a modal when the button is clicked.';
  name!: string;
  items = ['Sitio A', 'Sitio B', 'Sitio C', 'Sitio D'];
  idViaje: string | null = null;
  itinerarios: Itinerario[] = [];
  itinerariosDia: Itinerario[] = [];
  dias: Dia[] = [];
  segmentoSeleccionado: string = 'default';
  constructor(private route: ActivatedRoute, private http: HttpClient, private itinerarioService: ItineariosService, private diaService: DiaService) {
    addIcons({add})
  }

  ngOnInit() {
    this.idViaje = this.route.snapshot.paramMap.get('id');
    if (this.idViaje) {
      this.obtenerItinerariosEnRuta(this.idViaje);
      this.obtenerDiasItinerario(parseInt(this.idViaje));
    }
  }

  ngAfterViewInit(): void {
    // Corregimos los iconos (si no se ven)
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'assets/Logo1SinFondo.png',
      iconUrl: 'assets/Logo1SinFondo.png',
      shadowUrl: '',
      iconSize: [40, 40],
    });

    // Inicializamos el mapa
    this.map = L.map('map', {
      center: [40.4168, -3.7038],
      zoom: 6,
      attributionControl: false,
    });

    L.control.attribution({
      position: 'bottomleft'
    }).addTo(this.map);


    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© WayPlanner'
    }).addTo(this.map);

    // Añadir puntos existentes
    this.puntos.forEach(p => {
      L.marker([p.lat, p.lng]).addTo(this.map);
    });

    // 🔧 Arreglo crítico: invalidar tamaño después de mostrar el mapa
    setTimeout(() => {
      this.map.invalidateSize();
    }, 300);
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

  obtenerItinerariosEnRuta(idViaje: string) {
    this.itinerarioService.obtenerItineariosRuta(parseInt(idViaje)).subscribe({
      next: (itinerarios) => {
        console.log('Itinerarios recibidos:', itinerarios);
        this.itinerarios = itinerarios;
        this.mostrarMarcadoresEnMapa();
      },
      error: (err) => console.error('Error al obtener itinerarios:', err),
    });
  }

  obtenerDiasItinerario(idItinerario: number) {
    this.diaService.obtenerDias(idItinerario).subscribe({
      next: (dias) => {
        console.log('Días del itinerario recibidos:', dias);
        this.dias = dias;
      },
      error: (err) => {
        console.error('Error al obtener días del itinerario:', err);
      },
      complete: () => {
        console.log('Consulta de días del itinerario completada');
      }
    });
  }

  ObtenerItinerariosPorDia(dia: DiasItinerario){
    this.itinerarioService.obtenerItinerariosPorRutaDia(dia).subscribe({
      next: (response) => {
        console.log('Itinerarios obtenidos para el día:', response);
        this.itinerariosDia = response;
        return response;
      },
      error: (error) => {
        console.error('Error al obtener los itinerarios para el día:', error);
        return [];
      },
      complete: () => {
        console.log('Petición de itinerarios por día completada');
      }
    })
  }

  onDiaSeleccionado(idDia: number) {
    const diaSeleccionado = this.dias.find(d => d.id === idDia);
    if (!diaSeleccionado || !this.idViaje) return;

    const dto: DiasItinerario = {
      idViaje: parseInt(this.idViaje),
      fecha: diaSeleccionado.fecha
    };

    console.log('Enviando DTO:', dto);
    this.ObtenerItinerariosPorDia(dto);
  }


  mostrarMarcadoresEnMapa() {
    if (!this.map) return;
    this.itinerarios.forEach(it => {
      if (it.latitud && it.longitud) {
        const lat = parseFloat(it.latitud);
        const lng = parseFloat(it.longitud);
        L.marker([lat, lng])
          .bindPopup(`<strong>${it.actividad}</strong><br>${it.hora} (${it.duracion})`)
          .addTo(this.map);
      }
    });
  }

  onWillDismiss(event: CustomEvent<OverlayEventDetail>) {
    if (event.detail.role === 'confirm') {
      this.message = `Hello, ${event.detail.data}!`;
    }
  }

  eliminarItem(index: number) {
    this.itinerarios.splice(index, 1);
  }
}
