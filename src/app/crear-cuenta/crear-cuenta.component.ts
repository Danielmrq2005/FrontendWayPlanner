import { Component, OnInit } from '@angular/core';
import {AlertController, IonicModule} from "@ionic/angular";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {Registro} from "../Modelos/Registro";
import {CrearCuentaService} from "../Servicios/cear-cuenta.service";
import {Router} from "@angular/router";
import {HttpClientModule} from "@angular/common/http";

@Component({
  selector: 'app-crear-cuenta',
  templateUrl: './crear-cuenta.component.html',
  styleUrls: ['./crear-cuenta.component.scss'],
  standalone: true,
  imports: [
    IonicModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [CrearCuentaService]
})
export class CrearCuentaComponent  implements OnInit {

  registroForm: FormGroup;
  registro: Registro = new Registro();
  loginViewFlag: boolean = true;

  constructor(
    private registroService: CrearCuentaService,
    private fb: FormBuilder,
    private router: Router,
    private alertController: AlertController
  ) {
    this.registroForm = this.fb.group({
      nombre: [this.registro.nombre, Validators.required],
      email: [this.registro.email, [Validators.required, Validators.email]],
      telefono: [this.registro.telefono, Validators.required],
      password: [this.registro.password, Validators.required],
      fecha: [this.registro.fecha, Validators.required],
    });
  }

  ngOnInit() {}

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

  doRegister() {
    if (this.registroForm.valid) {
      this.registro = { ...this.registro, ...this.registroForm.value };

      console.log("Datos enviados:", this.registro);

      this.registroService.registrar(this.registro).subscribe({
        next: () => {
          console.info("Registro exitoso");
          this.router.navigate(['login']);
        },
        error: (e: any) => {
          if (e.status === 409) {
            this.showAlert('Error', 'El email o teléfono ya existe.');
          } else {
            this.showAlert('Exito', 'Usuario creado con éxito.');
            this.router.navigate(['login']);
          }
        },
      });
    } else {
      this.showAlert('Formulario inválido', 'Por favor, verifica los datos.');
    }
    }

}
