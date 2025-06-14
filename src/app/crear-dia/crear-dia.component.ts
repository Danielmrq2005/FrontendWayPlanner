import { Component, OnInit } from '@angular/core';
import {FormsModule} from "@angular/forms";
import {Dia} from "../Modelos/Dia";
import {NgForOf} from "@angular/common";
import {jwtDecode} from "jwt-decode";
import {DiaService} from "../Servicios/dia.service";
import {ViajeService} from "../Servicios/viaje.service";
import {Viaje} from "../Modelos/Viaje";
import {AlertController, IonicModule} from "@ionic/angular";
import {TemaService} from "../Servicios/tema.service";
import {ActivatedRoute, Router } from '@angular/router';

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

  constructor(private diaService: DiaService, private viajeService: ViajeService, private alertController: AlertController, private temaService: TemaService, private router: Router, private route: ActivatedRoute) {
    this.temaService.darkMode$.subscribe(isDark => {
      this.darkMode = isDark;
    });
  }

  // Inicializar el objeto dia con valores por defecto
  dia = {
    fecha: '',
    numeroDia: 0,
    diaSemana: '',
    idViaje: 0
  }

  idViajeSeleccionado: number = 0;
  idusuario: number = 0;
  viajes: Viaje[] = [];
  idViaje!: string | null;

  darkMode = false;


  ngOnInit() {
    this.obtenerViajesPorUsuario();
    // En tu componente origen (por ejemplo, itinerarios.component.ts)
    this.idViaje = history.state.idViaje;
  }

  async crearDia() {
    // Validaciones antes de crear el día
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

    // Asignar los valores del día al objeto Dia
    const diaData: Dia = {
      fecha: this.dia.fecha,
      numeroDia: this.dia.numeroDia,
      diaSemana: this.dia.diaSemana,
      idViaje: this.idViajeSeleccionado
    };

    // Creamos el dia
    this.diaService.crearDia(diaData).subscribe({
      next: (response) => {
        console.log('Día creado exitosamente:', response);
      },
      error: (err) => {
        console.error('Error al crear el día:', err);
        this.presentAlert('Ocurrió un error al crear el día.');
      },
      complete: () => {
        this.presentAlert("Día creado exitosamente.");
        this.dia = { fecha: '', numeroDia: 0, diaSemana: '', idViaje: 0 };
        this.router.navigate(['/itinerarios', this.idViaje]);
      }
    });
  }

  // Métdo para obtener el ID del usuario desde el token
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

  // Métdo para obtener los viajes del usuario
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

  cancelar(){
    this.router.navigate(['/itinerarios', this.idViaje]);
  }

  // Métdo para mostrar alertas
  async presentAlert(mensaje: string) {
    const alert = await this.alertController.create({
      header: 'Atención',
      message: mensaje,
      buttons: ['OK'],
    });
    await alert.present();
  }

}
