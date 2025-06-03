import {Component, Input, OnInit} from '@angular/core';
import {IonicModule, ModalController} from "@ionic/angular";
import {NgForOf, NgIf} from "@angular/common";
import {SafeResourceUrl,DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: 'app-detalles-itinerario',
  templateUrl: './detalles-itinerario.component.html',
  styleUrls: ['./detalles-itinerario.component.scss'],
  standalone: true,
  imports: [
    IonicModule,
    NgIf,
    NgForOf
  ]
})
export class DetallesItinerarioComponent  implements OnInit {
  @Input() itinerario: any;
  mapaUrl: SafeResourceUrl | undefined;

  constructor(private modalCtrl: ModalController, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    if (this.itinerario?.latitud && this.itinerario?.longitud) {
      const url = `https://www.google.com/maps?q=${this.itinerario.latitud},${this.itinerario.longitud}&hl=es&z=16&output=embed`;
      this.mapaUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
  }

  cerrar() {
    this.modalCtrl.dismiss();
  }

}
