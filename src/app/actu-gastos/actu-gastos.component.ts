import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {GastosService} from "../Servicios/gastos.service";
import {IonicModule, ToastController} from "@ionic/angular";
import {ActivatedRoute} from "@angular/router";
import {Gastos} from "../Modelos/Gastos";
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-actu-gastos',
  templateUrl: './actu-gastos.component.html',
  styleUrls: ['./actu-gastos.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
  ]
})
export class ActuGastosComponent  implements OnInit {

  gastoForm: FormGroup
  gastoId: number;

  constructor(private formBuilder: FormBuilder, private gastosService: GastosService, private toastController: ToastController, private Aroute: ActivatedRoute) {
    this.gastoForm = this.formBuilder.group({
      titulo: ['', Validators.required],
      cantidad: [null, [Validators.required, Validators.min(0)]],
      esIngreso: [false],
      categoria: ['', Validators.required],
      fecha: [''],
      viajeId: [1, Validators.required],

    });
    this.gastoId = +this.Aroute.snapshot.paramMap.get('id')!;
    console.log(this.gastoId);
  }

  actualizarGasto() {
    if (this.gastoForm.valid) {
      const gasto: Gastos = this.gastoForm.value;
      this.gastosService.actualizarGasto(this.gastoId, gasto).subscribe({
        next: () => {
          alert('Gasto actualizado con éxito');
        },
        error: (err) => {
          console.error(err);
          alert('Error al actualizar el gasto');
        },
      });
    }
  }
  ngOnInit() {}

}
