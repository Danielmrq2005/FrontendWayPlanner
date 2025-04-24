import { Component, OnInit } from '@angular/core';
import {IonicModule} from "@ionic/angular";

@Component({
  selector: 'app-itinerarios',
  templateUrl: './itinerarios.component.html',
  styleUrls: ['./itinerarios.component.scss'],
  standalone: true,
  imports: [IonicModule]
})
export class ItinerariosComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
