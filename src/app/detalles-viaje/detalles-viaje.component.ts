import { Component, OnInit } from '@angular/core';
import {IonButton, IonContent, IonHeader, IonTitle, IonToolbar} from "@ionic/angular/standalone";

@Component({
  selector: 'app-detalles-viaje',
  templateUrl: './detalles-viaje.component.html',
  styleUrls: ['./detalles-viaje.component.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton
  ]
})
export class DetallesViajeComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
