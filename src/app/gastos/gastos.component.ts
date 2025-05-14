import { Component, OnInit } from '@angular/core';
import {IonicModule} from "@ionic/angular";
import {VerGastos} from "../Modelos/VerGastos";
import {GastosService} from "../Servicios/gastos.service";
import {HttpClientModule} from "@angular/common/http";
import {CurrencyPipe, NgForOf} from "@angular/common";
import {RouterLink} from "@angular/router";
import {GastosResumenDTO} from "../Modelos/GastosResumen";

@Component({
  selector: 'app-gastos',
  templateUrl: './gastos.component.html',
  styleUrls: ['./gastos.component.scss'],
  standalone: true,
  imports: [
    IonicModule,
    HttpClientModule,
    CurrencyPipe,
    NgForOf,
    RouterLink
  ],
  providers: [GastosService],
})
export class GastosComponent  implements OnInit {

  Gastos: VerGastos[] = [];
  viajeId: number = 1;
  sidebarExpanded = false;
  resumen: GastosResumenDTO | null = null;




  constructor(private gastosService: GastosService) {}

  ngOnInit() {
    this.CargarGastos();
    this.gastosService.getResumenGastos(this.viajeId).subscribe((data) => {
      this.resumen = data;
    });
  }



  toggleSidebar() {
    this.sidebarExpanded = !this.sidebarExpanded;
  }
  CargarGastos() {
    this.gastosService.obtenerDiasConGastos(this.viajeId).subscribe(datos => {
      this.Gastos = datos;
      console.log('Datos cargados:', this.Gastos);
    }, error => {
      console.error('Error al cargar los gastos:', error);
    });
  }

  verificarId(id: number | undefined) {
    console.log('ID del gasto:', id);
  }
  eliminarGasto(id: number) {
    this.gastosService.eliminarGasto(id).subscribe({
      next: () => {
        this.CargarGastos();
      },
      error: (error) => {
        console.error('Error al eliminar gasto:', error);
      }
    });
  }

}
