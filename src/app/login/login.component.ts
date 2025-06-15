import { Component, OnInit } from '@angular/core';
import { AlertController, IonicModule } from "@ionic/angular";
import { Login } from "../Modelos/Login";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Observable } from "rxjs";
import { LoginService } from "../Servicios/login.services";
import { Router, RouterLink } from "@angular/router";
import { addIcons } from "ionicons";
import {
  idCard,
  idCardOutline,
  keyOutline,
  mailOutline,
  personCircle, personCircleOutline,
  personOutline,
  text,
  textOutline
} from "ionicons/icons";
import { jwtDecode } from "jwt-decode";
import { CommonModule } from "@angular/common";
import { HttpClient, HttpClientModule } from "@angular/common/http";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    IonicModule,
    ReactiveFormsModule,
    CommonModule,
    HttpClientModule,
  ],
  providers: [LoginService], // Inyección del servicio de login
})
export class LoginComponent implements OnInit {

  email: string = ''; // Email del usuario
  password: string = ''; // Contraseña del usuario
  login: Login = {} as Login; // Objeto de login que se enviará al backend
  loginForm: FormGroup; // Formulario reactivo
  loginViewFlag: boolean = true; // Bandera para alternar vistas si se necesitara
  Verificado: Observable<boolean> = new Observable<boolean>(); // Observable para ver si el usuario está verificado
  idusuario: number = 0; // ID del usuario obtenido del token

  constructor(
    private loginService: LoginService,
    private router: Router,
    private fb: FormBuilder,
    private alertController: AlertController
  ) {
    // Crear el formulario con validadores requeridos
    this.loginForm = this.fb.group({
      email: [this.login.email, Validators.required],
      password: [this.login.password, Validators.required],
    });

    // Agregar iconos que se usarán en la interfaz
    addIcons({
      personOutline, keyOutline, textOutline, mailOutline,
      idCard, idCardOutline, text, personCircle, personCircleOutline
    });
  }

  ngOnInit() {
    // Obtener el ID del usuario si ya está autenticado
    this.idusuario = this.obtenerUsuarioId();
  }

  obtenerUsuarioId(): number {
    // Intenta obtener el token del sessionStorage
    const token = sessionStorage.getItem('authToken');
    if (token) {
      try {
        // Decodifica el token y extrae el ID del usuario
        const decodedToken: any = jwtDecode(token);
        console.log(decodedToken);
        return decodedToken.tokenDataDTO?.id || null;
      } catch (error) {
        console.error('Error al decodificar el token', error);
      }
    }
    return 0; // Si no hay token válido, retorna 0
  }

  doLogin(): void {
    if (this.loginForm.valid) {
      // Validar formato del email
      if (!this.validateEmail(this.loginForm.value.email)) {
        this.presentAlert('Error de formato', 'El formato del email no es válido.');
        return;
      }

      // Asigna los valores del formulario al objeto de login
      this.login = { ...this.login, ...this.loginForm.value };

      // Llamar al servicio para loguearse
      this.loginService.loguear(this.login).subscribe({
        next: (respuesta) => {
          // Validar que la respuesta incluya un token
          if (!respuesta || !respuesta.token) {
            this.presentAlert('Error', 'Respuesta del servidor inválida.');
            return;
          }

          const token = respuesta.token;
          // Guardar el token en el sessionStorage
          sessionStorage.setItem("authToken", token);
          this.loginService.setAuthState(true); // Cambiar el estado de autenticación

          this.idusuario = this.obtenerUsuarioId(); // Obtener el ID del usuario

          if (!this.idusuario) {
            this.presentAlert('Error', 'No se pudo obtener el ID del usuario.');
            return;
          }

          // Redirigir al usuario a la vista de viajes
          this.router.navigate(['/viajes']);
          console.log('Usuario logueado (ID):', this.idusuario);
        },
        error: async (e) => {
          console.error(e);
          // Diferenciar los tipos de errores para mostrar mensajes apropiados
          if (e.status === 403) {
            await this.presentAlert('Cuenta no verificada', 'Tu cuenta no está verificada o tu cuenta no está registrada. Por favor, revisa tu correo electrónico.');
          } else if (e.status === 404) {
            await this.presentAlert('Cuenta no encontrada', 'No existe una cuenta con este correo electrónico.');
          } else if (e.status === 401) {
            await this.presentAlert('Error de autenticación', 'Usuario o contraseña incorrectos.');
          } else if (e.status === 0) {
            await this.presentAlert('Error de conexión', 'No se pudo conectar con el servidor.');
          } else {
            await this.presentAlert('Error', 'Hubo un problema al iniciar sesión. Intente nuevamente.');
          }
        }
      });
    } else {
      // Validaciones de campos vacíos
      if (this.loginForm.get('email')?.hasError('required')) {
        this.presentAlert('Campo requerido', 'El email es obligatorio.');
      } else if (this.loginForm.get('password')?.hasError('required')) {
        this.presentAlert('Campo requerido', 'La contraseña es obligatoria.');
      } else {
        this.presentAlert('Formulario inválido', 'Debes introducir usuario y contraseña.');
      }
    }
  }

  private validateEmail(email: string): boolean {
    // Regex básico para validar emails
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  async presentAlert(header: string, message: string) {
    // Mostrar alerta en pantalla con el mensaje correspondiente
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

}
