import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
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
    RouterLink,
    IonIcon,
    FormEditarMaletaComponent,
    NgIf
  ],
  standalone: true,
  styleUrls: ['./lista-maletas.component.scss']
})
export class ListaMaletasComponent implements OnInit {
  maletas: VerMaletasDTO[] = [];

  darkMode = false;

  maletaSeleccionada: VerMaletaDTO | null = null;

  @Output() editandoMaleta = new EventEmitter<boolean>();

  constructor(private route: ActivatedRoute, private maletaService: MaletaService, private temaService: TemaService, private alertController: AlertController) {
    this.temaService.darkMode$.subscribe(isDark => {
      this.darkMode = isDark;
    });
  }

  ngOnInit(): void {
    this.cargarMaletas();
  }

  cargarMaletas() {
    const viajeId = this.route.snapshot.paramMap.get('id');
    if (viajeId) {
      this.maletaService.getMaletasPorViaje(+viajeId).subscribe({
        next: (data) => {
          this.maletas = data;
          console.log('Maletas:', this.maletas);
        },
        error: (err) => {
          console.error('Error fetching maletas:', err);
        }
      });
    }
  }

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
        return '❓'; // signo de pregunta para otro tipo
    }
  }


  editarMaleta(event: Event, maleta: VerMaletaDTO) {
    event.stopPropagation();
    this.maletaSeleccionada = { ...maleta };
    this.editandoMaleta.emit(true);

  }

  cancelarEdicion() {
    this.maletaSeleccionada = null;
    this.editandoMaleta.emit(false);
  }

  guardarEdicion(maletaEditada: VerMaletaDTO) {
    if (!maletaEditada.id) {
      console.error('No se puede actualizar la maleta: ID faltante');
      return;
    }

    this.maletaService.actualizarMaleta(maletaEditada.id, maletaEditada).subscribe(() => {
      this.cargarMaletas();
      this.maletaSeleccionada = null;
      this.editandoMaleta.emit(false);
    });
  }

  async eliminarMaleta(maleta: VerMaletaDTO) {
    if (!maleta.id) {
      console.error('No se puede eliminar la maleta: ID faltante');
      return;
    }

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
      cssClass: this.darkMode ? 'custom-alert dark-alert' : 'custom-alert'
    });

    await alert.present();
  }
}
