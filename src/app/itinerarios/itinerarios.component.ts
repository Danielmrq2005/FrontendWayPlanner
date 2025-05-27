import {Component, OnInit, ViewChild} from '@angular/core';
import {IonicModule, IonModal} from "@ionic/angular";
import {addIcons} from "ionicons";
import {add} from "ionicons/icons";
import {FormsModule} from "@angular/forms";
import { OverlayEventDetail } from '@ionic/core/components';
import {ActivatedRoute, RouterLink} from "@angular/router";
import {ItineariosService} from "../Servicios/itinearios.service";
import {Itinerario} from "../Modelos/Itinerario";
import {NgForOf} from "@angular/common";

@Component({
  selector: 'app-itinerarios',
  templateUrl: './itinerarios.component.html',
  styleUrls: ['./itinerarios.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, RouterLink, NgForOf]
})
export class ItinerariosComponent  implements OnInit {
  @ViewChild(IonModal) modal!: IonModal;

  actividad!: string;
  message!: string;
  idViaje: string | null = null;
  Nombreusuario = 'Usuario';
  itinerarios: Itinerario[] = [];
  itinerariosDia : Itinerario[] = [];

  constructor(private route: ActivatedRoute, private itinerarioService: ItineariosService) {

    addIcons({add})
  }

  ngOnInit() {
    this.idViaje = this.route.snapshot.paramMap.get('id');
    if (this.idViaje) {
      this.ObtenerItinearios();
    } else {
      console.error('ID de viaje no disponible');
    }
  }

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  confirm() {
    this.modal.dismiss(this.actividad, 'confirm');
  }

  onWillDismiss(event: CustomEvent<OverlayEventDetail>) {
    if (event.detail.role === 'confirm') {
      this.message = `Hello, ${event.detail.data}!`;
    }
  }

  ObtenerItinearios() {
    if (this.idViaje) {
      this.itinerarioService.obtenerItinerariosPorViaje(parseInt(this.idViaje)).subscribe({
        next: (response) => {
          console.log('Itinerarios obtenidos:', response);
          this.itinerarios = response;
        },
        error: (error) => {
          console.error('Error al obtener los itinerarios:', error);
        },
        complete: () => {
          console.log('Petición de itinerarios completada');
        }
      });
    } else {
      console.error('ID de viaje no disponible');
    }
  }


}
