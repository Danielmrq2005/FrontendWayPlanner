import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ViajeService } from '../Servicios/viaje.service';
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
    DatePipe
  ]
})
export class DetallesViajeComponent implements OnInit {
  idViaje: number = 0;
  viaje?: Viaje;

  constructor(private route: ActivatedRoute,private viajeservice: ViajeService) {}

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
}
