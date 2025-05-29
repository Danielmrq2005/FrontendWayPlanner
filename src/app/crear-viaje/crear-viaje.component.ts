import { Component, OnInit } from '@angular/core';
import { FormsModule } from "@angular/forms";
import {
  IonButton,
  IonContent
} from "@ionic/angular/standalone";
import { Viaje } from "../Modelos/Viaje";
import { ViajeService } from "../Servicios/viaje.service";
import { ActivatedRoute, Router } from "@angular/router";
import { jwtDecode } from "jwt-decode";
import {IonicModule} from "@ionic/angular";

@Component({
  selector: 'app-crear-viaje',
  templateUrl: './crear-viaje.component.html',
  styleUrls: ['./crear-viaje.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    IonicModule,
    IonContent,
    IonButton,
  ]
})
export class CrearViajeComponent implements OnInit {

  viaje: Viaje | null = null;
  idViajeEditar: number | null = null;

  constructor(
    private viajeservice: ViajeService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.idViajeEditar = +id;
        this.cargarViajeExistente(this.idViajeEditar);
      }
    });
  }

  cargarViajeExistente(id: number) {
    this.viajeservice.viajePorId(id).subscribe({
      next: (viaje) => {
        this.viaje = viaje;
        (document.getElementById('nombre') as HTMLInputElement).value = viaje.nombre;
        (document.getElementById('descripcion') as HTMLInputElement).value = viaje.descripcion;
        (document.getElementById('fechaInicio') as HTMLInputElement).value = this.formatFecha(viaje.fechaInicio);
        (document.getElementById('fechaFin') as HTMLInputElement).value = this.formatFecha(viaje.fechaFin);
        (document.getElementById('destino') as HTMLInputElement).value = viaje.destino;
      },
      error: (err) => console.error('Error cargando viaje:', err)
    });
  }

  formatFecha(fecha: string | Date): string {
    const d = new Date(fecha);
    return d.toISOString().split('T')[0];
  }

  guardarViaje() {
    const idusuario = this.obtenerUsuarioId();

    const viajeForm: Viaje = {
      nombre : (document.getElementById('nombre') as HTMLInputElement).value,
      descripcion : (document.getElementById('descripcion') as HTMLInputElement).value,
      fechaInicio : new Date((document.getElementById('fechaInicio') as HTMLInputElement).value),
      fechaFin : new Date((document.getElementById('fechaFin') as HTMLInputElement).value),
      destino : (document.getElementById('destino') as HTMLInputElement).value,
      usuario : {
        id: idusuario
      }
    };

    if (this.idViajeEditar !== null) {
      viajeForm.id = this.idViajeEditar;
      this.viajeservice.editarViaje(this.idViajeEditar, viajeForm).subscribe({
        next: () => {
          console.log('Viaje actualizado exitosamente');
          this.router.navigate(['/viajes']);
        },
        error: (error) => {
          console.error('Error al actualizar el viaje:', error);
        }
      });
    } else {
      this.viajeservice.crearviaje(viajeForm).subscribe({
        next: () => {
          console.log('Viaje creado exitosamente');
          this.router.navigate(['/viajes']);
        },
        error: (error) => {
          console.error('Error al crear el viaje:', error);
        }
      });
    }
  }

  crearViaje() {
    // Método original sin modificar por si lo necesitas separado
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

}
