import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import { MaletaService } from '../../../Servicios/maleta.service';
import { VerMaletasDTO } from '../../../Modelos/Maletas/ver-maletas-dto';
import {NgForOf, NgIf} from "@angular/common";
import {IonIcon, IonLabel} from "@ionic/angular/standalone";
import {FormEditarMaletaComponent} from "../form-editar-maleta/form-editar-maleta.component";
import {VerMaletaDTO} from "../../../Modelos/Maletas/ver-maleta-dto";

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
  styleUrls: ['./lista-maletas.component.scss']
})
export class ListaMaletasComponent implements OnInit {
  maletas: VerMaletasDTO[] = [];

  maletaSeleccionada: VerMaletaDTO | null = null;

  constructor(private route: ActivatedRoute, private maletaService: MaletaService) {}

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
    this.maletaSeleccionada = { ...maleta }; // Se clona para evitar cambios directos
  }

  cancelarEdicion() {
    this.maletaSeleccionada = null;
  }

  guardarEdicion(maletaEditada: VerMaletaDTO) {
    if (!maletaEditada.id) {
      console.error('No se puede actualizar la maleta: ID faltante');
      return;
    }

    this.maletaService.actualizarMaleta(maletaEditada.id, maletaEditada).subscribe(() => {
      this.cargarMaletas();
      this.maletaSeleccionada = null;
    });
  }

}
