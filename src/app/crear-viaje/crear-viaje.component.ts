import { Component, OnInit } from '@angular/core';
import {FormsModule} from "@angular/forms";
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle, IonContent,
  IonDatetime, IonHeader,
  IonInput,
  IonItem,
  IonLabel, IonTextarea, IonTitle, IonToolbar
} from "@ionic/angular/standalone";
import {Viaje} from "../Modelos/Viaje";
import {UsuarioService} from "../Servicios/usuario.service";
import {ViajeService} from "../Servicios/viaje.service";
import {Router} from "@angular/router";
import {jwtDecode} from "jwt-decode";

@Component({
  selector: 'app-crear-viaje',
  templateUrl: './crear-viaje.component.html',
  styleUrls: ['./crear-viaje.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    IonContent,
    IonButton,
  ]
})
export class CrearViajeComponent  implements OnInit {

  constructor(private viajeservice: ViajeService,private router: Router) { }



  crearViaje(){
    const idusuario = this.obtenerUsuarioId();

    const nuevoViaje: Viaje = {
      nombre : (document.getElementById('nombre') as HTMLInputElement).value,
      descripcion : (document.getElementById('descripcion') as HTMLInputElement).value,
      fechaInicio : new Date((document.getElementById('fechaInicio') as HTMLInputElement).value),
      fechaFin : new Date((document.getElementById('fechaFin') as HTMLInputElement).value),
      destino : (document.getElementById('destino') as HTMLInputElement).value,
      usuario : {
        id: idusuario
      }
    };

    this.viajeservice.crearviaje(nuevoViaje).subscribe({
      next: () => {
        console.log('Viaje creado exitosamente');
        this.router.navigate(['/viajes']);

      } ,
      error: (error) => {
        console.error('Error al crear el viaje:', error);
      }
    })
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

  ngOnInit() {}

}
