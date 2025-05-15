import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {GastosService} from "../Servicios/gastos.service";
import {IonicModule, ToastController} from "@ionic/angular";


@Component({
  selector: 'app-crear-ingreso',
  templateUrl: './crear-ingreso.component.html',
  styleUrls: ['./crear-ingreso.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IonicModule,

  ]
})
export class CrearIngresoComponent  implements OnInit {
  ingresoForm: FormGroup

  constructor(private formBuilder: FormBuilder, private gastosService: GastosService, private toastController: ToastController) {
    this.ingresoForm = this.formBuilder.group({
      titulo: ['', Validators.required],
      cantidad: [null, [Validators.required, Validators.min(0)]],
      esIngreso: [true],
      categoria: ['', Validators.required],
      fecha: [''],
      viajeId: [1, Validators.required],

    });
  }

  async crearIngreso() {
    console.log('Método crearGasto llamado');
    console.log('Valores del formulario:', this.ingresoForm.value);

    if (!this.ingresoForm.valid) {
      console.error('Errores del formulario:', this.ingresoForm.errors);
      Object.keys(this.ingresoForm.controls).forEach(controlName => {
        const control = this.ingresoForm.get(controlName);
        console.error(`${controlName}:`, control?.errors);
      });
    }

    if (this.ingresoForm.valid) {
      console.log('Formulario válido:', this.ingresoForm.value);

      this.gastosService.crearGasto(this.ingresoForm.value).subscribe({
        next: async (response) => {
          console.log('Respuesta del backend:', response);
          const toast = await this.toastController.create({
            message: 'Gasto creado correctamente',
            duration: 2000,
            color: 'success'
          });
          await toast.present();
          this.ingresoForm.reset();
        },
        error: async (error) => {
          console.error('Error al crear el gasto:', error);
          const toast = await this.toastController.create({
            message: 'Error al crear el gasto',
            duration: 2000,
            color: 'danger'
          });
          await toast.present();
        }
      });
    } else {
      console.error('El formulario no es válido:', this.ingresoForm.errors);
    }
  }



  ngOnInit() {

  }

}
