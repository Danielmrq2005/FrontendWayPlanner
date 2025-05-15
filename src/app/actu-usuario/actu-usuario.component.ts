import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {UsuarioService} from "../Servicios/usuario.service";
import {ActivatedRoute, Router} from "@angular/router";
import {jwtDecode} from "jwt-decode";
import {IonicModule} from "@ionic/angular";
import {Registro} from "../Modelos/Registro";

@Component({
  selector: 'app-actu-usuario',
  templateUrl: './actu-usuario.component.html',
  styleUrls: ['./actu-usuario.component.scss'],
  standalone: true,
  imports: [
    IonicModule,
    ReactiveFormsModule,
  ]
})
export class ActuUsuarioComponent  implements OnInit {
  usuarioForm: FormGroup;
  idusuario: number = 0;
  actualizar: Registro = new Registro();

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.usuarioForm = this.fb.group({
      nombre: [this.actualizar.nombre, Validators.required],
      email: [this.actualizar.email, [Validators.required, Validators.email]],
      telefono: [this.actualizar.telefono, Validators.required],
      password: [this.actualizar.password, Validators.required],
      fecha: [this.actualizar.fecha, Validators.required],
    });
  }

  ngOnInit(){
    this.idusuario = this.obtenerUsuarioId();
    console.log('Usuario logueado (ID):', this.idusuario);

  }


  // @ts-ignore
  obtenerUsuarioId(): number{
    const token = sessionStorage.getItem('authToken');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        return decodedToken.tokenDataDTO?.id || null;
      } catch (error) {
        console.error('Error al decodificar el token', error);
      }
    }

  }

  actualizarUsuario():void {
    if (this.usuarioForm.valid) {
      this.usuarioService.ActualizarUsuario(this.idusuario, this.usuarioForm.value).subscribe({
        next: () => {
          console.log('Usuario actualizado con éxito');

        },
        error: (e) => {
          console.error('Error al actualizar el usuario', e);
        }
      });
      console.log('Datos enviados:', this.usuarioForm.value);

    } else {
      console.log('Formulario inválido');
    }
  }



}
