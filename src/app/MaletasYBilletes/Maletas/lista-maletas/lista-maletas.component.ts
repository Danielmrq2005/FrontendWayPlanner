import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import { MaletaService } from '../../../Servicios/maleta.service';
import { VerMaletasDTO } from '../../../Modelos/Maletas/ver-maletas-dto';
import {NgForOf, NgIf} from "@angular/common";
import {IonIcon, IonLabel} from "@ionic/angular/standalone";
import {FormEditarMaletaComponent} from "../form-editar-maleta/form-editar-maleta.component";
import {VerMaletaDTO} from "../../../Modelos/Maletas/ver-maleta-dto";
import {TemaService} from "../../../Servicios/tema.service";
import {VerItemDTO} from "../../../Modelos/Maletas/Items/VerItemDTO";
import {AlertController} from "@ionic/angular";

@Component({
  selector: 'app-lista-maletas',
  templateUrl: './lista-maletas.component.html',
  imports: [
    NgForOf,
    IonIcon,
    FormEditarMaletaComponent,
    NgIf
  ],
  standalone: true,
  styleUrls: ['./lista-maletas.component.scss']
})
export class ListaMaletasComponent implements OnInit {
  maletas: VerMaletasDTO[] = []; // Lista de maletas para mostrar en la UI

  darkMode = false; // Estado para modo oscuro

  maletaSeleccionada: VerMaletaDTO | null = null; // Maleta actualmente seleccionada para edición o detalle

  @Output() editandoMaleta = new EventEmitter<boolean>();
  // Evento para notificar si se está editando una maleta (true/false)

  // Inyección de dependencias: ruta activa, servicios, y controlador de alertas
  constructor(
    private route: ActivatedRoute,
    private maletaService: MaletaService,
    private temaService: TemaService,
    private alertController: AlertController,
    private router: Router
  ) {
    // Suscripción al observable del modo oscuro para actualizar la variable darkMode
    this.temaService.darkMode$.subscribe(isDark => {
      this.darkMode = isDark;
    });
  }



  // Ciclo de vida Angular: se ejecuta al inicializar el componente
  ngOnInit(): void {
    this.cargarMaletas(); // Cargar la lista de maletas al iniciar
  }

  NavegaMale(maletaId: number) {
    const currentUrl = this.router.url;
    this.router.navigate([`/items-maleta/${maletaId}`], { queryParams: { returnUrl: currentUrl } });
  }

  // Función para obtener maletas relacionadas a un viaje específico (obteniendo id de la ruta)
  cargarMaletas() {
    const viajeId = this.route.snapshot.paramMap.get('id'); // Obtener id del parámetro de la URL
    if (viajeId) {
      this.maletaService.getMaletasPorViaje(+viajeId).subscribe({
        next: (data) => {
          this.maletas = data; // Asignar la lista obtenida
          console.log('Maletas:', this.maletas);
        },
        error: (err) => {
          console.error('Error fetching maletas:', err);
        }
      });
    }
  }

  // Función para devolver un icono emoji según la categoría de la maleta
  getIconoPorCategoria(categoria: String): string {
    switch (categoria) {
      case 'MALETA_CABINA':
        return '👜'; // bolso de mano
      case 'MALETA_FACTURADA':
        return '🧳'; // maleta facturada
      case 'BOLSO':
        return '👝'; // mochila o bolso
      case 'MALETIN_PORTATIL':
        return '💼'; // maletín portátil
      case 'MOCHILA':
        return '🎒'; // mochila
      case 'OTRO':
      default:
        return '❓'; // signo de pregunta para categoría desconocida
    }
  }

  // Función para iniciar la edición de una maleta (detiene propagación para evitar navegación)
  editarMaleta(event: Event, maleta: VerMaletaDTO) {
    event.stopPropagation(); // Evita que se active el routerLink al hacer click en editar
    this.maletaSeleccionada = { ...maleta }; // Clonar la maleta seleccionada para editar
    this.editandoMaleta.emit(true); // Emitir evento que indica que se está editando
  }

  // Cancelar la edición, limpiando maleta seleccionada y notificando evento
  cancelarEdicion() {
    this.maletaSeleccionada = null;
    this.editandoMaleta.emit(false);
  }

  // Guardar cambios tras editar una maleta
  guardarEdicion(maletaEditada: VerMaletaDTO) {
    if (!maletaEditada.id) {
      console.error('No se puede actualizar la maleta: ID faltante');
      return;
    }

    // Llamar al servicio para actualizar maleta y luego recargar lista y limpiar selección
    this.maletaService.actualizarMaleta(maletaEditada.id, maletaEditada).subscribe(() => {
      this.cargarMaletas();
      this.maletaSeleccionada = null;
      this.editandoMaleta.emit(false);
    });
  }

  // Función para eliminar una maleta con confirmación mediante un alert modal
  async eliminarMaleta(maleta: VerMaletaDTO) {
    if (!maleta.id) {
      console.error('No se puede eliminar la maleta: ID faltante');
      return;
    }

    // Crear alerta de confirmación para eliminar la maleta
    const alert = await this.alertController.create({
      header: 'Eliminar maleta',
      message: `🗑️ ¿Eliminar "${maleta.nombre}"? Esta acción es irreversible.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'alert-cancel-button'
        },
        {
          text: 'Sí, eliminar',
          role: 'destructive',
          cssClass: 'alert-danger-button',
          handler: () => {
            // Si el usuario confirma, se llama al servicio para eliminar y actualizar la lista
            this.maletaService.eliminarMaleta(maleta.id!).subscribe({
              next: () => {
                this.maletas = this.maletas.filter(m => m.id !== maleta.id);
              },
              error: (err) => {
                console.error('Error al eliminar la maleta:', err);
              },
              complete: () => {
                console.log(`Maleta "${maleta.nombre}" eliminada.`);
                this.maletaSeleccionada = null;
                this.editandoMaleta.emit(false);
              }
            });
          }
        }
      ],
      cssClass: this.darkMode ? 'custom-alert dark-alert' : 'custom-alert' // Clases CSS para modo oscuro
    });

    // Mostrar la alerta modal
    await alert.present();
  }
}
