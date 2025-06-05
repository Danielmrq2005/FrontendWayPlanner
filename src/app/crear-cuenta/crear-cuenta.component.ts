import { Component, OnInit } from '@angular/core';
import {AlertController, IonicModule} from "@ionic/angular";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {Registro} from "../Modelos/Registro";
import {CrearCuentaService} from "../Servicios/cear-cuenta.service";
import {Router} from "@angular/router";


@Component({
  selector: 'app-crear-cuenta',
  templateUrl: './crear-cuenta.component.html',
  styleUrls: ['./crear-cuenta.component.scss'],
  standalone: true,
  imports: [
    IonicModule,
    ReactiveFormsModule,
  ]
})
export class CrearCuentaComponent implements OnInit {

  registroForm: FormGroup;
  registro: Registro = new Registro();

  constructor(
    private registroService: CrearCuentaService,
    private fb: FormBuilder,
    private router: Router,
    private alertController: AlertController
  ) {
    this.registroForm = this.fb.group({
      nombre: [
        this.registro.nombre,
        [Validators.required, Validators.minLength(3), Validators.maxLength(50)]
      ],
      email: [
        this.registro.email,
        [Validators.required, Validators.email]
      ],
      telefono: [
        this.registro.telefono,
        [Validators.required, Validators.pattern(/^\d+$/), Validators.minLength(9), Validators.maxLength(15)]
      ],
      password: [
        this.registro.password,
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        ]
      ],
      fechaNacimiento: [
        this.registro.fechaNacimiento,
        [Validators.required, this.validateAge]
      ],
    });
  }

  ngOnInit() {
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

  async doRegister() {
    if (this.registroForm.valid) {
      const loading = await this.alertController.create({
        message: 'Creando cuenta...',
        backdropDismiss: false
      });
      await loading.present();

      this.registro = {...this.registro, ...this.registroForm.value};

      this.registroService.registrar(this.registro).subscribe({
        next: async () => {
          await loading.dismiss();
          this.router.navigate(['verificar'], {
            state: {email: this.registro.email},
            skipLocationChange: true
          });
        },
        error: async (e: any) => {
          await loading.dismiss();
          let message = 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.';

          switch (e.status) {
            case 400:
              message = 'Solicitud inválida. Verifica los datos ingresados.';
              break;
            case 401:
              message = 'No autorizado. Por favor, inicia sesión.';
              break;
            case 403:
              message = 'Acceso denegado. No tienes permisos para realizar esta acción.';
              break;
            case 404:
              message = 'Recurso no encontrado. Por favor, verifica la URL.';
              break;
            case 409:
              message = 'El email o teléfono ya existe. Intenta con otros datos.';
              break;
            case 500:
              message = 'Error interno del servidor. Por favor, inténtalo más tarde.';
              break;
            case 0:
              message = 'Error de conexión. Verifica tu conexión a internet.';
              break;
          }

          await this.showAlert('Error', message);
        }
      });
    } else {
      const errors = this.getFormErrors();
      await this.showAlert('Formulario inválido', errors);
    }
  }

  private getFormErrors(): string {
    const errorMessages: string[] = [];
    const controls = this.registroForm.controls;

    if (controls['nombre']?.errors) {
      if (controls['nombre'].hasError('required')) {
        errorMessages.push('El nombre es obligatorio.');
      }
      if (controls['nombre'].hasError('minlength')) {
        errorMessages.push('El nombre debe tener al menos 3 caracteres.');
      }
      if (controls['nombre'].hasError('maxlength')) {
        errorMessages.push('El nombre no puede tener más de 50 caracteres.');
      }
    }

    if (controls['email']?.errors) {
      if (controls['email'].hasError('required')) {
        errorMessages.push('El email es obligatorio.');
      }
      if (controls['email'].hasError('email')) {
        errorMessages.push('El email no es válido.');
      }
    }

    if (controls['telefono']?.errors) {
      if (controls['telefono'].hasError('required')) {
        errorMessages.push('El teléfono es obligatorio.');
      }
      if (controls['telefono'].hasError('pattern')) {
        errorMessages.push('El teléfono solo puede contener números.');
      }
      if (controls['telefono'].hasError('minlength')) {
        errorMessages.push('El teléfono debe tener al menos 9 dígitos.');
      }
      if (controls['telefono'].hasError('maxlength')) {
        errorMessages.push('El teléfono no puede tener más de 15 dígitos.');
      }
    }

    if (controls['password']?.errors) {
      if (controls['password'].hasError('required')) {
        errorMessages.push('La contraseña es obligatoria.');
      }
      if (controls['password'].hasError('minlength')) {
        errorMessages.push('La contraseña debe tener al menos 8 caracteres.');
      }
      if (controls['password'].hasError('pattern')) {
        errorMessages.push('La contraseña debe incluir mayúsculas, minúsculas, números y un carácter especial.');
      }
    }

    if (controls['fechaNacimiento']?.errors) { // Cambiar 'fecha' a 'fechaNacimiento'
      if (controls['fechaNacimiento'].hasError('required')) {
        errorMessages.push('La fecha de nacimiento es obligatoria.');
      }
      if (controls['fechaNacimiento'].hasError('invalidAge')) {
        errorMessages.push('Debes tener al menos 18 años.');
      }
    }

    return errorMessages.join(' ');
  }

  private validateAge(control: any) {
    if (!control.value) {
      return {invalidAge: true};
    }

    const birthDate = new Date(control.value);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    // Ajustar la edad si el mes o día actual es menor al de nacimiento
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    return age >= 18 ? null : {invalidAge: true};
  }
}
