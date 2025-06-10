// Importaciones necesarias de Angular y módulos de Ionic
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ViajeService } from '../Servicios/viaje.service';
import { Router } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { Viaje } from "../Modelos/Viaje";
import { DatePipe } from "@angular/common";
import { TemaService } from "../Servicios/tema.service";

@Component({
  selector: 'app-detalles-viaje',
  templateUrl: './detalles-viaje.component.html',
  styleUrls: ['./detalles-viaje.component.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    DatePipe,
    RouterLink
  ]
})
export class DetallesViajeComponent implements OnInit {
  idViaje: number = 0;      // ID del viaje obtenido desde la URL
  viaje?: Viaje;            // Objeto del viaje con todos sus detalles
  darkMode = false;         // Variable para manejar el modo oscuro

  // Inyección de dependencias necesarias
  constructor(
    private route: ActivatedRoute,
    private viajeservice: ViajeService,
    private router: Router,
    private temaService: TemaService
  ) {
    // Suscripción al observable para aplicar modo oscuro
    this.temaService.darkMode$.subscribe(isDark => {
      this.darkMode = isDark;
    });
  }

  ngOnInit() {
    // Obtiene el parámetro "id" de la URL y lo guarda
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.idViaje = +id;
        console.log('ID del viaje:', this.idViaje);
      }
      // Llama al método para obtener los detalles del viaje
      this.obtenerDetallesViaje(this.idViaje);
    });
  }

  // Método para obtener los datos del viaje por su ID
  obtenerDetallesViaje(id: number): void {
    this.viajeservice.viajePorId(id).subscribe({
      next: (data) => {
        this.viaje = data;
      },
      error: (error) => {
        console.error('Error al obtener los detalles del viaje:', error);
      }
    });
  }

  // Método para eliminar el viaje actual
  eliminarViaje(id: number): void {
    this.viajeservice.eliminarViaje(id).subscribe({
      next: () => {
        console.log('Viaje eliminado exitosamente');
        this.router.navigate(['/viajes']); // Redirige a la lista de viajes
      },
      error: (error) => {
        console.error('Error al eliminar el viaje:', error);
      }
    });
  }

  // Método para redirigir al formulario de edición del viaje
  editarviaje(id: number): void {
    this.router.navigate(['/crear-viaje', id]);
  }
}
