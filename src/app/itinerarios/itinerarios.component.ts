import {Component, OnInit, ViewChild} from '@angular/core';
import {AlertController, IonicModule, IonModal} from "@ionic/angular";
import {addIcons} from "ionicons";
import {add, create, calendarNumberOutline} from "ionicons/icons";
import {FormsModule} from "@angular/forms";
import { OverlayEventDetail } from '@ionic/core/components';
import {ActivatedRoute, NavigationEnd, Router, RouterLink} from "@angular/router";
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
import {ViajeService} from "../Servicios/viaje.service";

// Decorador del componente Angular
@Component({
  selector: 'app-itinerarios',
  templateUrl: './itinerarios.component.html',
  styleUrls: ['./itinerarios.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, RouterLink, NgForOf, NgIf, MenuHamburguesaComponent]
})
export class ItinerariosComponent  implements OnInit {
  // Referencia al modal de Ionic
  @ViewChild(IonModal) modal!: IonModal;

  // Variables de estado y datos
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
  viajeNombre: string = '';

  // Inyección de dependencias y suscripciones iniciales
  constructor(
    private route: ActivatedRoute,
    private itinerarioService: ItineariosService,
    private diaService: DiaService,
    private temaService: TemaService,
    private modalController: ModalController,
    private viajeService: ViajeService,
    private router: Router,
    private alertController: AlertController
  ) {
    // Agrega iconos personalizados de Ionicons
    addIcons({add, create, calendarNumberOutline})
    addIcons({add})

    // Suscripción al modo oscuro
    this.temaService.darkMode$.subscribe(isDark => {
      this.darkMode = isDark;
    });

    // Suscripción a eventos de navegación para recargar datos al cambiar de ruta
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.ObtenerItinearios();
        this.ObtenerDiasPorViaje();
      }
    });
  }

  // Métdo de inicialización del componente
  ngOnInit() {
    this.idViaje = this.route.snapshot.paramMap.get('id');
    if (this.idViaje) {
      this.ObtenerItinearios();
      this.ObtenerDiasPorViaje();

      // Obtiene el nombre del viaje
      this.viajeService.viajePorId(+this.idViaje).subscribe({
        next: (viaje) => {
          this.viajeNombre = viaje.nombre;
        },
        error: (err) => {
          console.error('Error al obtener el viaje:', err);
          this.viajeNombre = 'Desconocido';
        }
      });

    } else {
      console.error('ID de viaje no disponible');
    }
  }

  // Alterna la visibilidad de la barra lateral
  toggleSidebar() {
    this.sidebarExpanded = !this.sidebarExpanded;
  }

  // Cierra el modal sin guardar cambios
  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  // Cierra el modal y confirma la acción
  confirm() {
    this.modal.dismiss(this.actividad, 'confirm');
  }

  // Maneja el evento de cierre del modal
  onWillDismiss(event: CustomEvent<OverlayEventDetail>) {
    if (event.detail.role === 'confirm') {
      this.message = `Hello, ${event.detail.data}!`;
    }
  }

  // Obtiene los itinerarios asociados al viaje
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

  irACrearDia() {
    // En tu componente origen (por ejemplo, itinerarios.component.ts)
    this.router.navigate(['/crear-dia'], { state: { idViaje: this.idViaje } });
  }

  irACrearItinerario() {
    // Navega a la página de creación de itinerario, pasando el ID del viaje
    this.router.navigate(['/crear-itinerario'], { state: { idViaje: this.idViaje } });
  }

  // Obtiene los días asociados al viaje
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

  // Cambia el segmento seleccionado (día específico o todos)
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

  getFechaDeItinerario(itinerarioId?: number): string {
    const dia = this.diasViaje.find(d => d.id === itinerarioId);
    return dia?.fecha || 'Sin fecha';
  }


  // Obtiene los itinerarios de un día específico
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

  // Filtra los horarios de un itinerario por día de la semana
  filtrarHorariosPorDia(itinerario: Itinerario, diaSemana?: string) {
    return itinerario.horarios.filter(horario => horario.dia === diaSemana);
  }

  // Abre el modal de detalles de un itinerario
  async abrirDetalle(itinerario: any) {
    const componentProps: any = {
      itinerario,
      idViaje: this.idViaje,
      segmentoSeleccionado: this.segmentoSeleccionado,
      ...(this.diaSeleccionado ? { diaSemana: this.diaSeleccionado } : {})
    };

    const modal = await this.modalController.create({
      component: DetallesItinerarioComponent,
      componentProps
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();

    // Si se eliminó un itinerario, recarga la lista correspondiente
    if (data?.eliminado) {
      if (this.segmentoSeleccionado === 'default') {
        this.ObtenerItinearios();
      } else if (this.diaSeleccionado) {
        const dto: DiasItinerario = {
          idViaje: parseInt(this.idViaje!),
          idDia: this.diaSeleccionado.id
        };
        this.ObtenerItinerariosPorDia(dto);
      }
    }
  }

  // Elimina un día y sus itinerarios asociados, mostrando confirmación
  async eliminarDia(dia: Dia | null) {
    if (!dia || !dia.id) {
      this.presentAlert("No se puede eliminar el día seleccionado. Por favor, selecciona un día válido.");
      return;
    }

    const alert = await this.alertController.create({
      header: '¿Estás seguro?',
      message: 'Se eliminará el día y todos sus itinerarios asociados. ¿Deseas continuar?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'confirm',
          handler: () => {
            this.diaService.eliminarDia(dia.id).subscribe({
              next: () => {
                this.presentAlert("Día eliminado correctamente.");

                // Actualizar la lista de días
                this.ObtenerDiasPorViaje();

                // Resetear la selección
                this.segmentoSeleccionado = 'default';
                this.diaSeleccionado = null;

                // Recargar itinerarios generales
                this.ObtenerItinearios();
              },
              error: (error) => {
                this.presentAlert("Error al eliminar el día: " + error.message);
              }
            });
          }
        }
      ]
    });

    await alert.present();
  }

  // Muestra una alerta informativa
  presentAlert(mensaje: string) {
    this.alertController.create({
      header: 'Información',
      message: mensaje,
      buttons: ['OK']
    }).then(alert => alert.present());
  }
}
