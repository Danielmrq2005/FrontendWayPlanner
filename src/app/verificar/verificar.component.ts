import { Component, OnInit } from '@angular/core';
import {UsuarioService} from "../Servicios/usuario.service";
import {IonicModule, ToastController} from "@ionic/angular";
import {Router} from "@angular/router";
import {FormsModule} from "@angular/forms";
import {LoginService} from "../Servicios/login.services";

@Component({
  selector: 'app-verificar',
  templateUrl: './verificar.component.html',
  styleUrls: ['./verificar.component.scss'],
  imports: [
    IonicModule,
    FormsModule
  ],
  standalone: true
})
export class VerificarComponent  implements OnInit {
  email: string = '';
  code: string = '';

  constructor(
    private loginService: LoginService,
    private toastController: ToastController,
    private router: Router
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.email = navigation.extras.state['email'];
    }
  }

  async verifyCode() {
    try {
      const response = await this.loginService.verifyCode(this.email, this.code).toPromise();

      const toast = await this.toastController.create({
        message: 'Código verificado correctamente',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
      this.router.navigate(['/login']);

    } catch (error: any) {
      let message = 'Código de verificación incorrecto';

      if (error.status === 404) {
        message = 'Email no encontrado';
      } else if (error.status === 400) {
        message = 'Código de verificación inválido';
      } else if (error.status === 0) {
        message = 'Error de conexión al servidor';
      }

      const toast = await this.toastController.create({
        message: message,
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    }
  }


  ngOnInit() {}

}
