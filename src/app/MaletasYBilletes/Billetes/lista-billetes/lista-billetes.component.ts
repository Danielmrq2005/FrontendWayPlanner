import { Component, OnInit } from '@angular/core';
import {FormItemMaletaComponent} from "../../Maletas/form-item-maleta/form-item-maleta.component";
import {IonicModule} from "@ionic/angular";
import {NgForOf, NgIf} from "@angular/common";
import {ActivatedRoute, RouterLink} from "@angular/router";
import {FormBilleteComponent} from "../form-billete/form-billete.component";
import {BilleteService} from "../../../Servicios/billete.service";
import {ListarBilletesDTO} from "../../../Modelos/Billetes/ListarBilletesDTO";
import {IonIcon} from "@ionic/angular/standalone";

@Component({
  selector: 'app-lista-billetes',
  templateUrl: './lista-billetes.component.html',
  styleUrls: ['./lista-billetes.component.scss'],
  standalone: true,
  imports: [
    IonicModule,
    NgForOf,
    NgIf,
    RouterLink,
    FormBilleteComponent
  ]
})
export class ListaBilletesComponent  implements OnInit {

  categoriaNombre: string = '';
  billeteNombre: string = '';

  billetes: ListarBilletesDTO[] = [];

  mostrarFormulario: boolean = false;
  mostrarListaBilletes: boolean = true;

  constructor(private route: ActivatedRoute, private billeteService: BilleteService) { }

  ngOnInit() {
    this.cargarBilletes();
    this.tituloCategoria();
  }

  tituloCategoria() {
    const categoria = this.route.snapshot.paramMap.get('categoria');
    if (categoria) {
      if (categoria === 'OTRO') {
        this.billeteNombre = 'Otros Billetes';
      }
      this.billeteNombre = 'Billetes de ' + this.getNombreCategoria(categoria);
    }
    else {
      this.billeteNombre = 'Billetes';
    }
  }

  getNombreCategoria(nombre: string): string {
    switch (nombre?.toUpperCase()) {
      case 'AVION':
        return 'Aviónes';
      case 'TREN':
        return 'Trenes';
      case 'AUTOBUS':
        return 'Autobuses';
      case 'BARCO':
        return 'Barco';
      case 'CONCIERTO':
        return 'Conciertos';
      case 'MUSEO':
        return 'Museos';
      case 'EVENTO':
        return 'Eventos';
      case 'OTRO':
      default:
        return 'Otro';
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

  cargarBilletes() {
    this.route.paramMap.subscribe(params => {
      const viajeId = Number(this.route.snapshot.paramMap.get('viajeId'));
      console.log('ID del viaje:', viajeId);
      const categoria = this.route.snapshot.paramMap.get('categoria');
      console.log('Categoría:', categoria);

      this.categoriaNombre = categoria || '';

      if (viajeId && categoria) {
        this.billeteService.getBilletesPorCategoriaYViaje(viajeId, categoria).subscribe({
          next: (data) => {
            this.billetes = data;
            console.log('Billetes cargados:', this.billetes);
          },
          error: (err) => {
            console.error('Error al cargar los billetes:', err);
          }
        });
      } else {
        console.error('Faltan parámetros en la ruta');
        console.log('viajeId:', viajeId);
        console.log('categoria:', categoria);
      }
    });
  }

  FormularioCancelado() {
    this.mostrarFormulario = false;
    this.mostrarListaBilletes = true;
  }

  verBillete(billete: ListarBilletesDTO) {
    this.mostrarFormulario = false;
    this.mostrarListaBilletes = true;
  }

  editarBillete(event: Event, billete: ListarBilletesDTO) {
  event.stopPropagation();
    localStorage.setItem('billeteId', billete.id.toString());
  }
}
