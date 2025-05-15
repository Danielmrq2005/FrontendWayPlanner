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
      this.login = {...this.login, ...this.loginForm.value};

      console.log('Email:', this.login.email);
      console.log('Contraseña:', this.login.password);

      this.loginService.loguear(this.login).subscribe({
        next: (respuesta) => {
          const token = respuesta.token;
          sessionStorage.setItem("authToken", token);
          this.loginService.setAuthState(true);

          this.idusuario = this.obtenerUsuarioId();
          this.router.navigate(['/viajes']);
          console.log('Usuario logueado (ID):', this.idusuario);

        },
        error: async (e) => {
          console.error(e);
          await this.presentAlert('Fallo al iniciar sesión', 'Usuario o contraseña incorrectos');
        }
      });
    } else {
      this.presentAlert('Formulario inválido', 'Debes introducir usuario y contraseña.');
    }
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
