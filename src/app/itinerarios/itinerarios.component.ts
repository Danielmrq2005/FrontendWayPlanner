import {Component, OnInit, ViewChild} from '@angular/core';
import {IonicModule, IonModal} from "@ionic/angular";
import {addIcons} from "ionicons";
import {add} from "ionicons/icons";
import {FormsModule} from "@angular/forms";
import { OverlayEventDetail } from '@ionic/core/components';
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-itinerarios',
  templateUrl: './itinerarios.component.html',
  styleUrls: ['./itinerarios.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, RouterLink]
})
export class ItinerariosComponent  implements OnInit {
  @ViewChild(IonModal) modal!: IonModal;

  actividad!: string;
  message!: string;
  Nombreusuario = 'Usuario';

  constructor() {

    addIcons({add})
  }

  ngOnInit() {}

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  confirm() {
    this.modal.dismiss(this.actividad, 'confirm');
  }

  onWillDismiss(event: CustomEvent<OverlayEventDetail>) {
    if (event.detail.role === 'confirm') {
      this.message = `Hello, ${event.detail.data}!`;
    }
  }

}
