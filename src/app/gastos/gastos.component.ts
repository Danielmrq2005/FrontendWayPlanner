import { Component, OnInit } from '@angular/core';
import {IonicModule} from "@ionic/angular";

@Component({
  selector: 'app-gastos',
  templateUrl: './gastos.component.html',
  styleUrls: ['./gastos.component.scss'],
  standalone: true,
  imports: [
    IonicModule
  ]
})
export class GastosComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
