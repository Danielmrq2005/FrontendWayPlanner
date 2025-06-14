import { Component, OnInit } from '@angular/core';
import {AlertController, IonicModule} from "@ionic/angular";
import {Login} from "../Modelos/Login";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {Observable} from "rxjs";
import {LoginService} from "../Servicios/login.services";
import {Router, RouterLink} from "@angular/router";
import {addIcons} from "ionicons";
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
import {jwtDecode} from "jwt-decode";
import {CommonModule} from "@angular/common";
import {HttpClient, HttpClientModule} from "@angular/common/http";

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
  providers: [LoginService],
})
export class LoginComponent  implements OnInit {

  email: string = '';
  password: string = '';
  login: Login = {} as Login;
  loginForm: FormGroup;
  loginViewFlag: boolean = true;
  Verificado: Observable<boolean> = new Observable<boolean>();
  idusuario: number = 0;


  constructor(private loginService: LoginService, private router: Router, private fb: FormBuilder, private alertController: AlertController) {
    this.loginForm = this.fb.group({
      email: [this.login.email, Validators.required],
      password: [this.login.password, Validators.required],
    });

    addIcons({
      personOutline, keyOutline, textOutline, mailOutline,
      idCard, idCardOutline, text, personCircle, personCircleOutline
    });
  }

  ngOnInit() {
    this.idusuario = this.obtenerUsuarioId();
  }


  // @ts-ignore
  obtenerUsuarioId(): number{
    const token = sessionStorage.getItem('authToken');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        console.log(decodedToken);
        return decodedToken.tokenDataDTO?.id || null;
      } catch (error) {
        console.error('Error al decodificar el token', error);
      }
    }

  }

  doLogin(): void {
    if (this.loginForm.valid) {
      if (!this.validateEmail(this.loginForm.value.email)) {
        this.presentAlert('Error de formato', 'El formato del email no es válido.');
        return;
      }


      this.login = {...this.login, ...this.loginForm.value};

      this.loginService.loguear(this.login).subscribe({
        next: (respuesta) => {
          if (!respuesta || !respuesta.token) {
            this.presentAlert('Error', 'Respuesta del servidor inválida.');
            return;
          }
          const token = respuesta.token;
          sessionStorage.setItem("authToken", token);
          this.loginService.setAuthState(true);

          this.idusuario = this.obtenerUsuarioId();
          if (!this.idusuario) {
            this.presentAlert('Error', 'No se pudo obtener el ID del usuario.');
            return;
          }

          this.router.navigate(['/viajes']);
          console.log('Usuario logueado (ID):', this.idusuario);
        },
        error: async (e) => {
          console.error(e);
          if (e.status === 403) {
            // This is specifically for unverified accounts
            await this.presentAlert('Cuenta no verificada', 'Tu cuenta no está verificada. Por favor, revisa tu correo electrónico.');
          } else if (e.status === 404) {
            // This is for non-existent accounts
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
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }


  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

}
