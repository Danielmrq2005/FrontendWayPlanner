import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {GastosService} from "../Servicios/gastos.service";
import {IonicModule, ToastController} from "@ionic/angular";
import {ActivatedRoute, Router} from "@angular/router";
import {TemaService} from "../Servicios/tema.service";


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
  ingresoForm: FormGroup;
  darkMode = false;


  constructor(
    private formBuilder: FormBuilder,
    private gastosService: GastosService,
    private toastController: ToastController,
    private router: Router,
    private route: ActivatedRoute,
    private temaService: TemaService
  ) {
    this.ingresoForm = this.formBuilder.group({
      titulo: ['', Validators.required],
      cantidad: [
        null,
        [
          Validators.required,
          Validators.min(0.01),
        ]
      ],
      esIngreso: [true],
      categoria: ['', Validators.required],
      fecha: [new Date().toISOString()],
      viajeId: ['', Validators.required],
      id: [0]
    });
    this.temaService.darkMode$.subscribe(isDark => {
      this.darkMode = isDark;
    });
  }

  cancelar() {
    // Método para cancelar la creación del gasto y redirigir a la lista de gastos
    this.router.navigate(['/gastos', this.ingresoForm.get('viajeId')?.value]);
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.ingresoForm.patchValue({
          viajeId: +id
        });
      }
    });
  }

  async crearIngreso() {
    if (this.ingresoForm.valid) {
      const ingreso = {
        ...this.ingresoForm.value,
        fecha: new Date().toISOString()
      };

      this.gastosService.crearGasto(ingreso).subscribe({
        next: async () => {
          const toast = await this.toastController.create({
            message: 'Ingreso creado correctamente',
            duration: 2000,
            color: 'success'
          });
          await toast.present();
          this.router.navigate(['/gastos', this.ingresoForm.get('viajeId')?.value]);
        },
        error: async (error) => {
          console.error('Error al crear el ingreso:', error);
          const toast = await this.toastController.create({
            message: 'Error al crear el ingreso',
            duration: 2000,
            color: 'danger'
          });
          await toast.present();
        }
      });
    }
  }
}
