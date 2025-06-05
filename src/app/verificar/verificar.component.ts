import { Component, OnInit } from '@angular/core';
import {UsuarioService} from "../Servicios/usuario.service";
import {IonicModule, LoadingController, ToastController} from "@ionic/angular";
import {Router} from "@angular/router";
import {FormsModule} from "@angular/forms";
import {LoginService} from "../Servicios/login.services";
import { lastValueFrom } from 'rxjs';
import { ViewChildren, ElementRef, QueryList } from '@angular/core';


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
export class VerificarComponent implements OnInit {
  email: string = '';
  @ViewChildren('input0, input1, input2, input3, input4, input5') inputs!: QueryList<ElementRef>;

  codeArray: string[] = ['', '', '', '', '', ''];

  constructor(
    private loginService: LoginService,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private router: Router
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.email = navigation.extras.state['email'];
    }
  }

  ngOnInit() {}

  moveFocus(event: any, index: number) {
    const input = event.target;
    const next = input.nextElementSibling;
    if (input.value && next) {
      next.focus();
    }
  }

  isCodeComplete(): boolean {
    return this.codeArray.every(char => char && char.trim() !== '');
  }

  async verifyCode() {
    const code = this.codeArray.join('');

    const loading = await this.loadingController.create({
      message: 'Verificando...',
      duration: 10000
    });
    await loading.present();

    try {
      const response = await this.loginService.verifyCode(this.email, code).toPromise();
      loading.dismiss();

      const toast = await this.toastController.create({
        message: 'Código verificado correctamente',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
      this.router.navigate(['/login']);

    } catch (error: any) {
      loading.dismiss();
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

  async reenviarCodigo() {
    const loading = await this.loadingController.create({
      message: 'Reenviando código...',
      duration: 5000
    });
    await loading.present();

    try {
      // Verificar que el email no esté vacío
      if (!this.email) {
        throw new Error('El email está vacío o no es válido.');
      }

      console.log('Enviando solicitud para reenviar código con email:', this.email);

      const response = await lastValueFrom(this.loginService.reenviarCodigo(this.email));
      console.log('Respuesta del servidor:', response);

      loading.dismiss();

      // Verificar si la respuesta es válida
      if (response) {
        const toast = await this.toastController.create({
          message: 'Código reenviado al correo',
          duration: 2000,
          color: 'success'
        });
        await toast.present();
      } else {
        throw new Error('Respuesta vacía o inesperada del servidor.');
      }
    } catch (error: any) {
      loading.dismiss();

      // Log detallado del error
      console.error('Error al reenviar el código:', error);

      let errorMessage = 'Error al reenviar el código';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.status === 0) {
        errorMessage = 'Error de conexión al servidor';
      } else if (error.status === 500) {
        errorMessage = 'Error interno del servidor';
      }

      const toast = await this.toastController.create({
        message: errorMessage,
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  handleInput(event: any, index: number) {
    const value = event.target.value;
    if (/^\d$/.test(value)) {
      this.codeArray[index] = value;

      // Si pegó varios caracteres a la vez
      if (value.length > 1) {
        const chars = value.split('');
        for (let i = 0; i < 6; i++) {
          this.codeArray[i] = chars[i] || '';
          const inputRef = this.inputs.toArray()[i];
          if (inputRef) {
            inputRef.nativeElement.value = this.codeArray[i];
          }

        }
        return;
      }

      // Enfocar el siguiente si existe
      const nextInput = this.inputs.toArray()[index + 1];
      if (nextInput) nextInput.nativeElement.focus();
    } else {
      this.codeArray[index] = '';
    }
  }

  handleKeyDown(event: KeyboardEvent, index: number) {
    const inputRef = this.inputs.toArray()[index];

    if (event.key === 'Backspace') {
      if (this.codeArray[index]) {
        this.codeArray[index] = '';
      } else {
        const prevInput = this.inputs.toArray()[index - 1];
        if (prevInput) {
          prevInput.nativeElement.focus();
          this.codeArray[index - 1] = '';
        }
      }
    } else if (event.key === 'ArrowLeft') {
      const prevInput = this.inputs.toArray()[index - 1];
      if (prevInput) prevInput.nativeElement.focus();
    } else if (event.key === 'ArrowRight') {
      const nextInput = this.inputs.toArray()[index + 1];
      if (nextInput) nextInput.nativeElement.focus();
    }
  }

  handlePaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    const digits = pastedData.replace(/\D/g, '').slice(0, 6).split('');

    const inputsArr = this.inputs.toArray();
    for (let i = 0; i < digits.length; i++) {
      this.codeArray[i] = digits[i];
      const inputRef = inputsArr[i];
      if (inputRef) {
        inputRef.nativeElement.value = digits[i];
      }
    }

    if (digits.length > 0) {
      const last = inputsArr[digits.length - 1];
      if (last) last.nativeElement.focus();
    }
  }

}
