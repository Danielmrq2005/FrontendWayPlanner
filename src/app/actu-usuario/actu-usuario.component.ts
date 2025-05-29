import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { UsuarioService } from "../Servicios/usuario.service";
import { ActivatedRoute, Router } from "@angular/router";
import { jwtDecode } from "jwt-decode";
import { IonicModule } from "@ionic/angular";
import { Registro } from "../Modelos/Registro";

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
export class ActuUsuarioComponent implements OnInit {
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
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      password: ['', Validators.required],
      fecha: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.idusuario = this.obtenerUsuarioId();
    if (this.idusuario) {
      this.cargarDatosUsuario();
    }
  }

  cargarDatosUsuario() {
    this.usuarioService.obtenerUsuarioPorId(this.idusuario).subscribe({
      next: (usuario) => {
        this.usuarioForm.patchValue({
          nombre: usuario.nombre,
          email: usuario.email,
          telefono: usuario.telefono,
          fecha: usuario.fechaRegistro
        });
      },
      error: (error) => {
        console.error('Error al cargar datos del usuario', error);
      }
    });
  }

  obtenerUsuarioId(): number {
    const token = sessionStorage.getItem('authToken');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        return decodedToken.tokenDataDTO?.id || null;
      } catch (error) {
        console.error('Error al decodificar el token', error);
        return 0;
      }
    }
    return 0;
  }

  actualizarUsuario(): void {
    if (this.usuarioForm.valid) {
      this.usuarioService.ActualizarUsuario(this.idusuario, this.usuarioForm.value).subscribe({
        next: () => {
          console.log('Usuario actualizado con éxito');
        },
        error: (e) => {
          console.error('Error al actualizar el usuario', e);
        }
      });
    } else {
      console.log('Formulario inválido');
    }
  }
}
