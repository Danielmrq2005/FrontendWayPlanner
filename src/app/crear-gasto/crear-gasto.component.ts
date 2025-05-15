import { Component, OnInit } from '@angular/core';
import {IonicModule, ToastController} from "@ionic/angular";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {GastosService} from "../Servicios/gastos.service";
import {HttpClientModule} from "@angular/common/http";

@Component({
  selector: 'app-crear-gasto',
  templateUrl: './crear-gasto.component.html',
  styleUrls: ['./crear-gasto.component.scss'],
  standalone: true,
  imports: [
    IonicModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [GastosService],
})
export class CrearGastoComponent  implements OnInit {
  gastoForm: FormGroup

  constructor(private formBuilder: FormBuilder, private gastosService: GastosService, private toastController: ToastController) {
    this.gastoForm = this.formBuilder.group({
      titulo: ['', Validators.required],
      cantidad: [null, [Validators.required, Validators.min(0)]],
      esIngreso: [false],
      categoria: ['', Validators.required],
      fecha: [''],
      viajeId: [1, Validators.required],

    });
  }

  async crearGasto() {
    console.log('Método crearGasto llamado');
    console.log('Valores del formulario:', this.gastoForm.value);

    if (!this.gastoForm.valid) {
      console.error('Errores del formulario:', this.gastoForm.errors);
      Object.keys(this.gastoForm.controls).forEach(controlName => {
        const control = this.gastoForm.get(controlName);
        console.error(`${controlName}:`, control?.errors);
      });
    }

    if (this.gastoForm.valid) {
      console.log('Formulario válido:', this.gastoForm.value);

      this.gastosService.crearGasto(this.gastoForm.value).subscribe({
        next: async (response) => {
          console.log('Respuesta del backend:', response);
          const toast = await this.toastController.create({
            message: 'Gasto creado correctamente',
            duration: 2000,
            color: 'success'
          });
          await toast.present();
          this.gastoForm.reset();
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
      console.error('El formulario no es válido:', this.gastoForm.errors);
    }
  }



  ngOnInit() {

  }

}
