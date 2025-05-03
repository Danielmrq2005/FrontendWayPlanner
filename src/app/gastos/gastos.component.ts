import { Component, OnInit } from '@angular/core';
import {IonicModule} from "@ionic/angular";
import {VerGastos} from "../Modelos/VerGastos";
import {GastosService} from "../Servicios/gastos.service";
import {HttpClientModule} from "@angular/common/http";
import {CurrencyPipe, NgForOf} from "@angular/common";

@Component({
  selector: 'app-gastos',
  templateUrl: './gastos.component.html',
  styleUrls: ['./gastos.component.scss'],
  standalone: true,
  imports: [
    IonicModule,
    HttpClientModule,
    CurrencyPipe,
    NgForOf
  ],
  providers: [GastosService],
})
export class GastosComponent  implements OnInit {

  Gastos: VerGastos[] = [];
  viajeId: number = 1;

  constructor(private gastosService: GastosService) {}

  ngOnInit() {
    this.CargarGastos();
  }

  CargarGastos() {
    this.gastosService.obtenerDiasConGastos(this.viajeId).subscribe(datos => {
      this.Gastos = datos;
      console.log(this.Gastos);
    }, error => {
      console.error('Error al cargar los gastos:', error);
    });
  }

}
