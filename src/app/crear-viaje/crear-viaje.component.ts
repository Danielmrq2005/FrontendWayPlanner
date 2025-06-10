// Importación de módulos necesarios de Angular y Ionic
import { Component, OnInit } from '@angular/core';
import { FormsModule } from "@angular/forms";
import {
  IonButton,
  IonContent, IonText
} from "@ionic/angular/standalone";
import { Viaje } from "../Modelos/Viaje";
import { ViajeService } from "../Servicios/viaje.service";
import { ActivatedRoute, Router } from "@angular/router";
import { jwtDecode } from "jwt-decode";
import { TemaService } from "../Servicios/tema.service";
import { IonicModule } from "@ionic/angular";
import { CommonModule } from "@angular/common";

@Component({
  selector: 'app-crear-viaje',
  templateUrl: './crear-viaje.component.html',
  styleUrls: ['./crear-viaje.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    IonContent,
    IonButton,
    IonText
  ]
})
export class CrearViajeComponent implements OnInit {

  // Variables para manipular el viaje
  viaje: Viaje | null = null;
  idViajeEditar: number | null = null;
  darkMode = false;

  mensajeError: string | null = null;

  // Campos del formulario
  nombre = '';
  descripcion = '';
  fechaInicioStr = '';
  fechaFinStr = '';
  destino = '';

  constructor(
    private viajeservice: ViajeService,
    private router: Router,
    private route: ActivatedRoute,
    private temaService: TemaService
  ) {}

  ngOnInit() {
    // Detecta si se pasó un ID por parámetro para editar un viaje
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.idViajeEditar = +id;
        this.cargarViajeExistente(this.idViajeEditar);
      }
    });

    // Se suscribe al tema para saber si está en modo oscuro
    this.temaService.darkMode$.subscribe(isDark => {
      this.darkMode = isDark;
    });
  }

  // Carga los datos del viaje que se quiere editar
  cargarViajeExistente(id: number) {
    this.viajeservice.viajePorId(id).subscribe({
      next: (viaje) => {
        this.nombre = viaje.nombre;
        this.descripcion = viaje.descripcion;
        this.fechaInicioStr = this.formatFecha(viaje.fechaInicio);
        this.fechaFinStr = this.formatFecha(viaje.fechaFin);
        this.destino = viaje.destino;
      },
      error: (err) => console.error('Error cargando viaje:', err)
    });
  }

  // Da formato YYYY-MM-DD a una fecha
  formatFecha(fecha: string | Date): string {
    const d = new Date(fecha);
    return d.toISOString().split('T')[0];
  }

  // Valida y guarda un viaje nuevo o actualizado
  guardarViaje() {
    const fechaInicio = new Date(this.fechaInicioStr);
    const fechaFin = new Date(this.fechaFinStr);
    const hoy = new Date();

    // Normaliza todas las fechas a medianoche para evitar errores de zona horaria
    hoy.setHours(0, 0, 0, 0);
    fechaInicio.setHours(0, 0, 0, 0);
    fechaFin.setHours(0, 0, 0, 0);

    // Validaciones del formulario
    if (!this.nombre || !this.descripcion || !this.fechaInicioStr || !this.fechaFinStr || !this.destino) {
      this.mensajeError = 'Por favor, rellena todos los campos.';
      return;
    }

    if (fechaInicio < hoy) {
      this.mensajeError = "La fecha de inicio no puede ser anterior a hoy.";
      return;
    }

    if (fechaInicio.getTime() === hoy.getTime()) {
      this.mensajeError = "La fecha de inicio no puede ser hoy.";
      return;
    }

    if (fechaFin < hoy) {
      this.mensajeError = "La fecha de fin no puede ser anterior a hoy.";
      return;
    }

    if (fechaFin <= fechaInicio) {
      this.mensajeError = "La fecha de fin debe ser posterior a la de inicio.";
      return;
    }

    this.mensajeError = null;

    // Obtiene el ID del usuario desde el token
    const idusuario = this.obtenerUsuarioId();

    // Se arma el objeto Viaje
    const viajeForm: Viaje = {
      nombre: this.nombre,
      descripcion: this.descripcion,
      fechaInicio,
      fechaFin,
      destino: this.destino,
      usuario: {
        id: idusuario
      }
    };

    // Si se está editando un viaje, se actualiza
    if (this.idViajeEditar !== null) {
      viajeForm.id = this.idViajeEditar;
      this.viajeservice.editarViaje(this.idViajeEditar, viajeForm).subscribe({
        next: () => this.router.navigate(['/viajes']),
        error: (error) => {
          console.error('Error al actualizar el viaje:', error);
          this.router.navigate(['/viajes']);
        }
      });
    } else {
      // Si es nuevo, se crea
      this.viajeservice.crearviaje(viajeForm).subscribe({
        next: () => this.router.navigate(['/viajes']),
        error: (error) => {
          console.error('Error al crear el viaje:', error);
        }
      });
    }
  }


  // Decodifica el token JWT para obtener el ID del usuario
  obtenerUsuarioId(): number {
    const token = sessionStorage.getItem('authToken');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        return decodedToken.tokenDataDTO?.id || 0;
      } catch (error) {
        console.error('Error al decodificar el token', error);
      }
    }
    return 0;
  }
}
