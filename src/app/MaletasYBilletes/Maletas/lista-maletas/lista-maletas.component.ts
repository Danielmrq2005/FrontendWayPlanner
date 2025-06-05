import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import { MaletaService } from '../../../Servicios/maleta.service';
import { VerMaletasDTO } from '../../../Modelos/Maletas/ver-maletas-dto';
import {NgForOf} from "@angular/common";
import {IonIcon, IonLabel} from "@ionic/angular/standalone";

@Component({
  selector: 'app-lista-maletas',
  templateUrl: './lista-maletas.component.html',
  imports: [
    NgForOf,
    RouterLink,
    IonIcon
  ],
  styleUrls: ['./lista-maletas.component.scss']
})
export class ListaMaletasComponent implements OnInit {
  maletas: VerMaletasDTO[] = [];

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

  editarMaleta(event: Event, maleta: any) {
    event.stopPropagation();
    // Aquí va la lógica para editar la maleta
    console.log('Editar maleta:', maleta);
  }
}
