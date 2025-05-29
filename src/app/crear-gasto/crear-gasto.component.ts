import { Component, OnInit } from '@angular/core';
import {IonicModule, ToastController} from "@ionic/angular";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {GastosService} from "../Servicios/gastos.service";
import {ActivatedRoute, Router} from "@angular/router";


@Component({
  selector: 'app-crear-gasto',
  templateUrl: './crear-gasto.component.html',
  styleUrls: ['./crear-gasto.component.scss'],
  standalone: true,
  imports: [
    IonicModule,
    ReactiveFormsModule,

  ]
})
export class CrearGastoComponent  implements OnInit {
  gastoForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private gastosService: GastosService,
    private toastController: ToastController,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.gastoForm = this.formBuilder.group({
      titulo: ['', Validators.required],
      cantidad: [null, [Validators.required, Validators.min(0)]],
      esIngreso: [false],
      categoria: ['', Validators.required],
      fecha: [''],
      viajeId: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.gastoForm.patchValue({
          viajeId: +id
        });
      }
    });
  }

  async crearGasto() {
    if (this.gastoForm.valid) {
      this.gastosService.crearGasto(this.gastoForm.value).subscribe({
        next: async (response) => {
          const toast = await this.toastController.create({
            message: 'Gasto creado correctamente',
            duration: 2000,
            color: 'success'
          });
          await toast.present();
          this.router.navigate(['/gastos', this.gastoForm.get('viajeId')?.value]);
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
    }
  }
}




