import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { UsuarioService } from "../Servicios/usuario.service";
import { ActivatedRoute, Router } from "@angular/router";
import { jwtDecode } from "jwt-decode";
import {AlertController, IonicModule} from "@ionic/angular";
import { Registro } from "../Modelos/Registro";
import {TemaService} from "../Servicios/tema.service";

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
  darkMode = false;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private route: ActivatedRoute,
    private router: Router,
    private temaService: TemaService,
    private alertController: AlertController
  ) {
    this.usuarioForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^\d+$/), Validators.minLength(9), Validators.maxLength(15)]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]],
      fechaNacimiento: ['', [Validators.required, this.validateAge]]
    });

    this.temaService.darkMode$.subscribe(isDark => {
      this.darkMode = isDark;
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
          password: '', // no se recupera, debe escribirse de nuevo
          fechaNacimiento: usuario.fechaRegistro
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

  async actualizarUsuario(): Promise<void> {
    if (this.usuarioForm.valid) {
      this.usuarioService.ActualizarUsuario(this.idusuario, this.usuarioForm.value).subscribe({
        next: async () => {
          const alert = await this.alertController.create({
            header: 'Éxito',
            message: 'Datos actualizados correctamente.',
            buttons: ['OK']
          });
          await alert.present();
        },
        error: async (e) => {
          console.error('Error al actualizar:', e); // Log para depurar
          const alert = await this.alertController.create({
            header: 'Error',
            message: 'Error al actualizar los datos. Intenta de nuevo.',
            buttons: ['OK']
          });
          await alert.present();
        }
      });
    } else {
      const errors = this.getFormErrors();
      const alert = await this.alertController.create({
        header: 'Formulario inválido',
        message: errors,
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  private getFormErrors(): string {
    const errorMessages: string[] = [];
    const controls = this.usuarioForm.controls;

    if (controls['nombre']?.errors) {
      if (controls['nombre'].hasError('required')) errorMessages.push('El nombre es obligatorio.');
      if (controls['nombre'].hasError('minlength')) errorMessages.push('El nombre debe tener al menos 3 caracteres.');
      if (controls['nombre'].hasError('maxlength')) errorMessages.push('El nombre no puede tener más de 50 caracteres.');
    }

    if (controls['email']?.errors) {
      if (controls['email'].hasError('required')) errorMessages.push('El email es obligatorio.');
      if (controls['email'].hasError('email')) errorMessages.push('El email no es válido.');
    }

    if (controls['telefono']?.errors) {
      if (controls['telefono'].hasError('required')) errorMessages.push('El teléfono es obligatorio.');
      if (controls['telefono'].hasError('pattern')) errorMessages.push('El teléfono solo puede contener números.');
      if (controls['telefono'].hasError('minlength')) errorMessages.push('El teléfono debe tener al menos 9 dígitos.');
      if (controls['telefono'].hasError('maxlength')) errorMessages.push('El teléfono no puede tener más de 15 dígitos.');
    }

    if (controls['password']?.errors) {
      if (controls['password'].hasError('required')) errorMessages.push('La contraseña es obligatoria.');
      if (controls['password'].hasError('minlength')) errorMessages.push('La contraseña debe tener al menos 8 caracteres.');
      if (controls['password'].hasError('pattern')) errorMessages.push('La contraseña debe incluir mayúsculas, minúsculas, números y un carácter especial.');
    }

    if (controls['fechaNacimiento']?.errors) {
      if (controls['fechaNacimiento'].hasError('required')) errorMessages.push('La fecha de nacimiento es obligatoria.');
      if (controls['fechaNacimiento'].hasError('invalidAge')) errorMessages.push('Debes tener al menos 18 años.');
    }

    return errorMessages.join(' ');
  }

  private validateAge(control: any) {
    if (!control.value) return { invalidAge: true };

    const birthDate = new Date(control.value);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    return age >= 18 ? null : { invalidAge: true };
  }
}
