import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import { ViajeService } from '../Servicios/viaje.service';
import { Router } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import {Viaje} from "../Modelos/Viaje";
import {DatePipe} from "@angular/common";

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
  idViaje: number = 0;
  viaje?: Viaje;

  constructor(private route: ActivatedRoute,private viajeservice: ViajeService, private router: Router) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.idViaje = +id;
        console.log('ID del viaje:', this.idViaje);
      }
      this.obtenerDetallesViaje(this.idViaje);
    });
  }

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

  eliminarViaje(id: number): void {
    this.viajeservice.eliminarViaje(id).subscribe({
      next: () => {
        console.log('Viaje eliminado exitosamente');
        this.router.navigate(['/viajes']);
      },
      error: (error) => {
        console.error('Error al eliminar el viaje:', error);
      }
    });
  }


  editarviaje(id: number): void {
    this.router.navigate(['/crear-viaje', id]);
  }


}
