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

  constructor(private route: ActivatedRoute, private http: HttpClient, private itinerarioService: ItineariosService, private diaService: DiaService) {
    addIcons({add})
  }

  ngOnInit() {
    this.idViaje = this.route.snapshot.paramMap.get('id');
    if (this.idViaje) {
      this.obtenerItinerariosEnRuta()
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

    // Click para seleccionar punto
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      const nuevoMarcador = L.marker([lat, lng]).addTo(this.map);
      this.puntoSeleccionado.emit({ lat, lng });
    });

    // 🔧 Arreglo crítico: invalidar tamaño después de mostrar el mapa
    setTimeout(() => {
      this.map.invalidateSize();
    }, 300);
  }

  reordenar(event: CustomEvent) {
    const movedItem = this.items.splice(event.detail.from, 1)[0];
    this.items.splice(event.detail.to, 0, movedItem);
    event.detail.complete();
  }

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  confirm() {
    this.modal.dismiss(this.name, 'confirm');
  }

  obtenerItinerariosEnRuta() {
    this.itinerarioService.obtenerItineariosRuta().subscribe({
      next: (itinerarios) => {
        console.log('Itinerarios en ruta recibidos:', itinerarios);
        // Aquí puedes asignar los itinerarios a una propiedad si lo necesitas
      },
      error: (err) => {
        console.error('Error al obtener itinerarios en ruta:', err);
      },
      complete: () => {
        console.log('Consulta de itinerarios en ruta completada');
      }
    });
  }

  onWillDismiss(event: CustomEvent<OverlayEventDetail>) {
    if (event.detail.role === 'confirm') {
      this.message = `Hello, ${event.detail.data}!`;
    }

  }
}
