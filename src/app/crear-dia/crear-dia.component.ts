import { Component, OnInit } from '@angular/core';
import {FormsModule} from "@angular/forms";
import {Dia} from "../Modelos/Dia";
import {NgForOf} from "@angular/common";
import {jwtDecode} from "jwt-decode";
import {DiaService} from "../Servicios/dia.service";
import {ViajeService} from "../Servicios/viaje.service";
import {Viaje} from "../Modelos/Viaje";
import {AlertController, IonicModule} from "@ionic/angular";

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

  constructor(private diaService: DiaService, private viajeService: ViajeService, private alertController: AlertController) { }

  dia = {
    fecha: '',
    numeroDia: 0,
    diaSemana: '',
    idViaje: 0
  }

  idViajeSeleccionado: number = 0;
  idusuario: number = 0;
  viajes: Viaje[] = [];

  ngOnInit() {
    this.obtenerViajesPorUsuario();
  }

  async crearDia() {
    if (this.dia.fecha.trim() === '') {
      await this.presentAlert('Por favor, selecciona una fecha.');
      return;
    }

    if (this.dia.numeroDia <= 0) {
      await this.presentAlert('El número de día debe ser mayor que cero.');
      return;
    }

    if (this.dia.diaSemana.trim() === '') {
      await this.presentAlert('Por favor, selecciona un día de la semana.');
      return;
    }

    if (!this.idViajeSeleccionado) {
      await this.presentAlert('Por favor, selecciona un viaje.');
      return;
    }

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
        this.presentAlert('Ocurrió un error al crear el día.');
      },
      complete: () => {
        console.log('Proceso de creación de día completado');
        this.dia = { fecha: '', numeroDia: 0, diaSemana: '', idViaje: 0 };
      }
    });
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

  async presentAlert(mensaje: string) {
    const alert = await this.alertController.create({
      header: 'Atención',
      message: mensaje,
      buttons: ['OK'],
    });
    await alert.present();
  }

}
