import { Component, OnInit } from '@angular/core';
import {AlertController, IonicModule} from "@ionic/angular";
import { VerGastos } from "../Modelos/VerGastos";
import { GastosService } from "../Servicios/gastos.service";
import { CommonModule, CurrencyPipe, NgForOf } from "@angular/common";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { GastosResumenDTO } from "../Modelos/GastosResumen";
import { MenuHamburguesaComponent } from "../menu-hamburguesa/menu-hamburguesa.component";
import { TemaService } from "../Servicios/tema.service";

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

  Gastos: VerGastos[] = []; // Lista de gastos organizados por días
  viajeId: number = 0; // ID del viaje actual
  sidebarExpanded = false; // Controla si el menú lateral está expandido
  resumen: GastosResumenDTO | null = null; // Resumen general de ingresos y gastos
  darkMode = false; // Indica si el modo oscuro está activado

  constructor(
    private gastosService: GastosService, // Servicio para manejar operaciones de gastos
    private route: ActivatedRoute, // Obtener parámetros de la ruta
    private temaService: TemaService, // Servicio para manejar el tema oscuro
    private alert: AlertController // Controlador de alertas para mostrar mensajes al usuario
  ) {
    // Suscripción al estado del modo oscuro
    this.temaService.darkMode$.subscribe(isDark => {
      this.darkMode = isDark;
    });
  }

  ngOnInit() {
    // Obtener el ID del viaje desde la URL y cargar los datos
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.viajeId = +id; // Convertir el id a número
        this.CargarGastos(); // Cargar gastos del viaje
        // Obtener el resumen de gastos del viaje
        this.gastosService.getResumenGastos(this.viajeId).subscribe((data) => {
          console.log('Resumen cargado:', data);
          this.resumen = data;
        }, error => {
          console.error('Error al cargar el resumen:', error);
        });
      }
    });
    this.temaService.darkMode$.subscribe(isDark => {
      this.darkMode = isDark;
      document.body.classList.toggle('dark', isDark); // Forzar clase en el body
    });
  }

  toggleSidebar() {
    // Alternar la visibilidad del menú lateral
    this.sidebarExpanded = !this.sidebarExpanded;
  }

  CargarGastos() {
    // Llama al servicio para obtener los días con gastos y actualiza la lista
    this.gastosService.obtenerDiasConGastos(this.viajeId).subscribe(datos => {
      this.Gastos = datos;
      console.log('Datos cargados:', this.Gastos);
    }, error => {
      console.error('Error al cargar los gastos:', error);
    });
  }

  verificarId(id: number | undefined) {
    // Función auxiliar para imprimir el ID de un gasto
    console.log('ID del gasto:', id);
  }

  async eliminarGasto(id: number) {
    const alert = await this.alert.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro de que deseas eliminar este gasto?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Eliminación cancelada');
          }
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.gastosService.eliminarGasto(id).subscribe({
              next: () => {
                this.CargarGastos(); // Recargar los datos tras la eliminación
                console.log('Gasto eliminado');
              },
              error: (error) => {
                console.error('Error al eliminar gasto:', error);
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }
}
