import { Component, OnInit } from '@angular/core';
import {IonicModule, ToastController} from "@ionic/angular";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {GastosService} from "../Servicios/gastos.service";
import {ActivatedRoute, Router} from "@angular/router";
import {TemaService} from "../Servicios/tema.service";

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
  gastoForm: FormGroup; // Formulario reactivo para capturar los datos del gasto
  darkMode = false; // Variable para controlar el modo oscuro

  constructor(
    private formBuilder: FormBuilder, // Constructor de formularios
    private gastosService: GastosService,
    private toastController: ToastController, // Controlador para mostrar toasts (mensajes emergentes)
    private router: Router, // Navegación entre rutas
    private route: ActivatedRoute, // Acceso a los parámetros de la ruta
    private temaService: TemaService
  ) {
    // Inicialización del formulario con sus validaciones
    this.gastoForm = this.formBuilder.group({
      titulo: ['', Validators.required],
      cantidad: [null, [Validators.required, Validators.min(0)]],
      esIngreso: [false],
      categoria: ['', Validators.required],
      fecha: [''],
      viajeId: ['', Validators.required],
    });

    // Suscripción al modo oscuro para cambiar el estado
    this.temaService.darkMode$.subscribe(isDark => {
      this.darkMode = isDark;
    });
  }

  ngOnInit() {
    // Se obtiene el ID del viaje desde la URL y se asigna al formulario
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
    // Si el formulario es válido, se crea el gasto
    if (this.gastoForm.valid) {
      this.gastosService.crearGasto(this.gastoForm.value).subscribe({
        next: async (response) => {
          // Mostrar mensaje de éxito
          const toast = await this.toastController.create({
            message: 'Gasto creado correctamente',
            duration: 2000,
            color: 'success'
          });
          await toast.present();
          // Redirigir a la vista de gastos del viaje correspondiente
          this.router.navigate(['/gastos', this.gastoForm.get('viajeId')?.value]);
        },
        error: async (error) => {
          console.error('Error al crear el gasto:', error);
          // Mostrar mensaje de error
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
