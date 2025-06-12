import { Component, OnInit } from '@angular/core';
import { IonicModule } from "@ionic/angular";
import { VerGastos } from "../Modelos/VerGastos";
import { GastosService } from "../Servicios/gastos.service";
import {CommonModule, CurrencyPipe, NgForOf} from "@angular/common";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { GastosResumenDTO } from "../Modelos/GastosResumen";
import { MenuHamburguesaComponent } from "../menu-hamburguesa/menu-hamburguesa.component";
import {TemaService} from "../Servicios/tema.service";

@Component({
  selector: 'app-gastos',
  templateUrl: './gastos.component.html',
  styleUrls: ['./gastos.component.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CurrencyPipe,
    NgForOf,
    RouterLink,
    MenuHamburguesaComponent,
    CommonModule
  ]
})
export class GastosComponent implements OnInit {

  Gastos: VerGastos[] = [];
  viajeId: number = 0;
  sidebarExpanded = false;
  resumen: GastosResumenDTO | null = null;
  darkMode = false;

  constructor(
    private gastosService: GastosService,
    private route: ActivatedRoute,
    private temaService: TemaService
  ) {
    this.temaService.darkMode$.subscribe(isDark => {
      this.darkMode = isDark;
    });
  }


  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.viajeId = +id; // Convertir a número
        this.CargarGastos();
        this.gastosService.getResumenGastos(this.viajeId).subscribe((data) => {
          console.log('Resumen cargado:', data);
          this.resumen = data;
        }, error => {
          console.error('Error al cargar el resumen:', error);
        });
      }
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
