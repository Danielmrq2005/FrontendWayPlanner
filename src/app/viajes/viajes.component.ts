import { Component, OnInit } from '@angular/core';
import { UsuarioService } from '../Servicios/usuario.service';
import { ViajeService } from '../Servicios/viaje.service';
import {Router, RouterLink} from '@angular/router';

import {
  IonContent, IonFab, IonFabButton,
  IonHeader, IonIcon,
  IonTitle, IonToolbar
} from "@ionic/angular/standalone";
import { jwtDecode } from "jwt-decode";
import { Login } from "../Modelos/Login";
import {Viaje} from "../Modelos/Viaje";
import {NgForOf} from "@angular/common";

@Component({
  selector: 'app-viajes',
  templateUrl: './viajes.component.html',
  styleUrls: ['./viajes.component.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonTitle,
    IonToolbar,
    NgForOf,
    RouterLink
  ]
})
export class ViajesComponent implements OnInit {
  idusuario: number = 0;
  Nombreusuario: string | undefined = '';
  viajes: Viaje[] = [];


  constructor(private usuarioservice: UsuarioService,private viajeservice: ViajeService,private router: Router) { }


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


  ngOnInit() {
    this.idusuario = this.obtenerUsuarioId();

    if (this.idusuario) {
      this.viajeservice.listarViajesPorUsuario(this.idusuario).subscribe({
        next: (viajes: Viaje[]) => {
          const hoy = new Date();

          viajes.forEach(via => {
            const fechaViaje = new Date(via.fechaInicio);

            if (fechaViaje <= hoy) {
              this.viajeservice.eliminarViaje(via.id).subscribe({
                next: () => {
                  console.log('Viaje eliminado:', via.id);
                },
                error: (error) => {
                  console.error('Error al eliminar el viaje:', error);
                }
              });
            }
          });

          this.viajes = viajes.filter(v => new Date(v.fechaInicio) > hoy);
        },
        error: (err: any) => console.error('Error al obtener los viajes:', err)
      });
    }

    if (this.idusuario) {
      this.usuarioservice.obtenerUsuarioId(this.idusuario).subscribe({
        next: (usuario: Login) => {
          this.Nombreusuario = usuario.nombre;
          console.log('Nombre del usuario:', this.Nombreusuario);
        },
        error: (err) => {
          console.error('Error al obtener el usuario:', err);
        }
      });
    }
  }
}
