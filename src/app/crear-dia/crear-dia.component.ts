import { Component, OnInit } from '@angular/core';
import {FormsModule} from "@angular/forms";
import {Dia} from "../Modelos/Dia";
import {NgForOf} from "@angular/common";
import {jwtDecode} from "jwt-decode";
import {DiaService} from "../Servicios/dia.service";
import {ViajeService} from "../Servicios/viaje.service";
import {Viaje} from "../Modelos/Viaje";
import {IonicModule} from "@ionic/angular";
import {TemaService} from "../Servicios/tema.service";

@Component({
  selector: 'app-crear-dia',
  templateUrl: './crear-dia.component.html',
  styleUrls: ['./crear-dia.component.scss'],
  imports: [
    FormsModule,
    NgForOf,
    IonicModule,
  ]
})
export class CrearDiaComponent implements OnInit {

  constructor(private diaService: DiaService, private viajeService: ViajeService, private temaService: TemaService) {
    this.temaService.darkMode$.subscribe(isDark => {
      this.darkMode = isDark;
    });
  }

  dia = {
    fecha: '',
    numeroDia: 0,
    diaSemana: '',
    idViaje: 0
  }

  idViajeSeleccionado: number = 0;
  idusuario: number = 0;
  viajes: Viaje[] = [];

  darkMode = false;


  ngOnInit() {
    this.obtenerViajesPorUsuario();
  }

  crearDia() {
    console.log('Valores actuales del día:', this.dia);
    if (
      this.dia.fecha.trim() !== '' &&
      this.dia.numeroDia > 0 &&
      this.dia.diaSemana.trim() !== '' &&
      this.idViajeSeleccionado
    ) {
      const diaData: Dia = {
        fecha: this.dia.fecha,
        numeroDia: this.dia.numeroDia,
        diaSemana: this.dia.diaSemana,
        idViaje: this.idViajeSeleccionado
      };

      this.diaService.crearDia(diaData).subscribe({
        next: (response) => {
          console.log('Día creado exitosamente:', response);
        },
        error: (err) => {
          console.error('Error al crear el día:', err);
        },
        complete: () => {
          console.log('Proceso de creación de día completado');
          this.dia = { fecha: '', numeroDia: 0, diaSemana: '', idViaje: 0 };
        }
      });
    } else {
      console.warn('Por favor, completa todos los campos del día antes de enviar.');
    }
  }

  obtenerUsuarioId(): number {
    const token = sessionStorage.getItem('authToken');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        console.log(decodedToken);
        return decodedToken.tokenDataDTO?.id || 0;
      } catch (error) {
        console.error('Error al decodificar el token', error);
      }
    }
    return 0;
  }

  obtenerViajesPorUsuario() {
    this.idusuario = this.obtenerUsuarioId();
    if (this.idusuario) {
      this.viajeService.listarViajesPorUsuario(this.idusuario).subscribe({
        next: (viajes) => {
          this.viajes = viajes;
          console.log('Viajes recibidos:', viajes);
          // Aquí puedes asignar los viajes a una propiedad si lo necesitas
        },
        error: (err) => {
          console.error('Error al obtener viajes:', err);
        },
        complete: () => {
          console.log('Consulta de viajes completada');
        }
      });
    }
  }



}
