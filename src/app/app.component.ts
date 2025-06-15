import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import {NotificacionPopupComponent} from "./notificacion-popup/notificacion-popup.component";


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, NotificacionPopupComponent],
  standalone: true,
})
export class AppComponent {
  constructor() {}
}
