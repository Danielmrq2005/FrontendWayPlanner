import {Component, OnInit, ViewChild} from '@angular/core';
import {IonicModule, IonModal} from "@ionic/angular";
import {addIcons} from "ionicons";
import {add, create, calendarNumberOutline} from "ionicons/icons";
import {FormsModule} from "@angular/forms";
import { OverlayEventDetail } from '@ionic/core/components';
import {ActivatedRoute, RouterLink} from "@angular/router";
import {ItineariosService} from "../Servicios/itinearios.service";
import {Itinerario} from "../Modelos/Itinerario";
import {NgForOf, NgIf} from "@angular/common";
import {DiaService} from "../Servicios/dia.service";
import {Dia} from "../Modelos/Dia";
import {DiasItinerario} from "../Modelos/DiasItinerario";
import { ModalController } from '@ionic/angular';
import {DetallesItinerarioComponent} from "../detalles-itinerario/detalles-itinerario.component";
import {MenuHamburguesaComponent} from "../menu-hamburguesa/menu-hamburguesa.component";
import {TemaService} from "../Servicios/tema.service";

@Component({
  selector: 'app-itinerarios',
  templateUrl: './itinerarios.component.html',
  styleUrls: ['./itinerarios.component.scss'],
  standalone: true,
    imports: [IonicModule, FormsModule, RouterLink, NgForOf, NgIf, MenuHamburguesaComponent]
})
export class ItinerariosComponent  implements OnInit {
  @ViewChild(IonModal) modal!: IonModal;

  actividad!: string;
  message!: string;
  idViaje: string | null = null;
  segmentoSeleccionado: string = 'default';
  itinerarios: Itinerario[] = [];
  diasViaje : Dia[] = [];
  itinerariosDia : Itinerario[] = [];
  sidebarExpanded = false;
  darkMode = false;
  diaSeleccionado: Dia | null = null;

  constructor(private route: ActivatedRoute, private itinerarioService: ItineariosService, private diaService: DiaService, private temaService: TemaService, private modalController: ModalController) {

    addIcons({add, create, calendarNumberOutline})
    addIcons({add})
    this.temaService.darkMode$.subscribe(isDark => {
      this.darkMode = isDark;
    });
  }

  ngOnInit() {
    this.idViaje = this.route.snapshot.paramMap.get('id');
    if (this.idViaje) {
      this.ObtenerItinearios();
      this.ObtenerDiasPorViaje();
    } else {
      console.error('ID de viaje no disponible');
    }
  }

  toggleSidebar() {
    this.sidebarExpanded = !this.sidebarExpanded;
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

  ObtenerDiasPorViaje() {
    if (this.idViaje) {
      this.diaService.obtenerDias(parseInt(this.idViaje)).subscribe({
        next: (response) => {
          console.log('Días obtenidos:', response);
          this.diasViaje = response;
        },
        error: (error) => {
          console.error('Error al obtener los días:', error);
        },
        complete: () => {
          console.log('Petición de días completada');
        }
      });
    } else {
      console.error('ID de viaje no disponible');
    }
  }

  seleccionarSegmento(segmento: string) {
    this.segmentoSeleccionado = segmento;

    if (segmento !== 'default') {
      const index = parseInt(segmento.replace('dia', ''));
      this.diaSeleccionado = this.diasViaje[index];

      const dto: DiasItinerario = {
        idViaje: parseInt(this.idViaje!),
        idDia: this.diaSeleccionado.id
      };
      console.info('FechaDTO: ', dto);
      this.ObtenerItinerariosPorDia(dto);
    }
  }

  ObtenerItinerariosPorDia(dia: DiasItinerario){
    this.itinerarioService.obtenerItinerariosPorDia(dia).subscribe({
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

  filtrarHorariosPorDia(itinerario: Itinerario, diaSemana?: string) {
    return itinerario.horarios.filter(horario => horario.dia === diaSemana);
  }

  async abrirDetalle(itinerario: any) {
    const modal = await this.modalController.create({
      component: DetallesItinerarioComponent,
      componentProps: { itinerario }
    });
    await modal.present();
  }

}
