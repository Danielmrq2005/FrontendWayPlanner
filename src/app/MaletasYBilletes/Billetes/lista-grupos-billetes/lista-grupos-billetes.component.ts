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
export class ListaGruposBilletesComponent implements OnInit {
  // Array que almacenará los grupos de billetes obtenidos del backend
  gruposBilletes: CategoriasBilleteDTO[] = [];

  // ID del viaje actual, extraído de la URL
  viajeId: number | null = null;

  constructor(private route: ActivatedRoute, private billeteService: BilleteService) { }

  /**
   * Método que se ejecuta al inicializar el componente.
   * Obtiene el ID del viaje desde la URL y realiza la llamada al servicio
   * para obtener los grupos de billetes asociados a ese viaje.
   */
  ngOnInit() {
    // Obtener el parámetro 'id' de la ruta (string o null)
    const viajeId = this.route.snapshot.paramMap.get('id');
    console.log('ID del viaje:', viajeId);

    if (viajeId) {
      // Convertir el ID a número y asignarlo a la propiedad local
      this.viajeId = +viajeId;

      // Llamar al servicio para obtener los grupos de billetes por viaje
      this.billeteService.getGruposBilletesPorViaje(+viajeId).subscribe({
        next: (data) => {
          // Guardar la lista recibida en la variable local
          this.gruposBilletes = data;
          console.log('Grupos de billetes:', this.gruposBilletes);
        },
        error: (err) => {
          // Manejar error en la llamada al servicio
          console.error('Error fetching grupos de billetes:', err);
        }
      });
    }
  }

  /**
   * Devuelve un emoji representativo según la categoría recibida.
   * @param nombre Nombre de la categoría
   * @returns Emoji correspondiente o un signo de interrogación si no se reconoce
   */
  getEmojiPorCategoria(nombre: string): string {
    switch (nombre?.toUpperCase()) {
      case 'AVION': return '✈️';
      case 'TREN': return '🚆';
      case 'AUTOBUS': return '🚌';
      case 'BARCO': return '🚢';
      case 'CONCIERTO': return '🎵';
      case 'MUSEO': return '🖼️';
      case 'EVENTO': return '🎫';
      case 'OTRO':
      default: return '❓';
    }
  }

  /**
   * Retorna el nombre amigable para mostrar en la UI según la categoría.
   * @param nombre Categoría recibida en string
   * @returns Nombre legible con acentos donde corresponde
   */
  getNombreCategoria(nombre: string): string {
    switch (nombre?.toUpperCase()) {
      case 'AVION': return 'Avión';
      case 'TREN': return 'Tren';
      case 'AUTOBUS': return 'Autobús';
      case 'BARCO': return 'Barco';
      case 'CONCIERTO': return 'Concierto';
      case 'MUSEO': return 'Museo';
      case 'EVENTO': return 'Evento';
      case 'OTRO':
      default: return 'Otro';
    }
  }
}

