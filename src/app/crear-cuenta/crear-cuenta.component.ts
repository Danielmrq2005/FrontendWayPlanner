import { Component, OnInit } from '@angular/core';
import {IonicModule} from "@ionic/angular";

@Component({
  selector: 'app-crear-cuenta',
  templateUrl: './crear-cuenta.component.html',
  styleUrls: ['./crear-cuenta.component.scss'],
  standalone: true,
  imports: [
    IonicModule
  ]
})
export class CrearCuentaComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
