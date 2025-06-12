import { Component, OnInit } from '@angular/core';
import {NgForOf, NgIf} from "@angular/common";
import { BilleteService } from "../../../Servicios/billete.service";
import { CategoriasBilleteDTO } from "../../../Modelos/Billetes/categorias-billete-dto";
import {ActivatedRoute, RouterLink} from "@angular/router";
import {IonIcon, IonLabel} from "@ionic/angular/standalone";

@Component({
  selector: 'app-lista-grupos-billetes',
  templateUrl: './lista-grupos-billetes.component.html',
  styleUrls: ['./lista-grupos-billetes.component.scss'],
  standalone: true,
  imports: [
    NgForOf,
    IonIcon,
    RouterLink,
    NgIf
  ]
})
export class ListaGruposBilletesComponent  implements OnInit {
  gruposBilletes: CategoriasBilleteDTO[] = [];

  viajeId: number | null = null;

  constructor(private route: ActivatedRoute, private billeteService: BilleteService) { }

  ngOnInit() {
    const viajeId = this.route.snapshot.paramMap.get('id');
    console.log('ID del viaje:', viajeId);
    if (viajeId) {
      this.viajeId = +viajeId;
      this.billeteService.getGruposBilletesPorViaje(+viajeId).subscribe({
        next: (data) => {
          this.gruposBilletes = data;
          console.log('Grupos de billetes:', this.gruposBilletes);
        },
        error: (err) => {
          console.error('Error fetching grupos de billetes:', err);
        }
      });
    }
  }

  getEmojiPorCategoria(nombre: string): string {
    switch (nombre?.toUpperCase()) {
      case 'AVION':
        return '✈️';
      case 'TREN':
        return '🚆';
      case 'AUTOBUS':
        return '🚌';
      case 'BARCO':
        return '🚢';
      case 'CONCIERTO':
        return '🎵';
      case 'MUSEO':
        return '🖼️';
      case 'EVENTO':
        return '🎫';
      case 'OTRO':
      default:
        return '❓';
    }
  }

  getNombreCategoria(nombre: string): string {
    switch (nombre?.toUpperCase()) {
      case 'AVION':
        return 'Avión';
      case 'TREN':
        return 'Tren';
      case 'AUTOBUS':
        return 'Autobús';
      case 'BARCO':
        return 'Barco';
      case 'CONCIERTO':
        return 'Concierto';
      case 'MUSEO':
        return 'Museo';
      case 'EVENTO':
        return 'Evento';
      case 'OTRO':
      default:
        return 'Otro';
    }
  }
}
