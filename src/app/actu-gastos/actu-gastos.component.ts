import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {GastosService} from "../Servicios/gastos.service";
import {IonicModule, ToastController} from "@ionic/angular";
import {ActivatedRoute, Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {TemaService} from "../Servicios/tema.service";
import {CommonModule} from "@angular/common";


@Component({
  selector: 'app-actu-gastos',
  templateUrl: './actu-gastos.component.html',
  styleUrls: ['./actu-gastos.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    CommonModule
  ]
})
export class ActuGastosComponent implements OnInit {

  gastoForm: FormGroup;
  gastoId: number;
  private viajeId: number = 0;
  darkMode = false;

  constructor(
    private formBuilder: FormBuilder,
    private gastosService: GastosService,
    private toastController: ToastController,
    private route: ActivatedRoute,
    private router: Router,
    private temaService: TemaService,
  ) {
    // Inicializa el formulario con validaciones
    this.gastoForm = this.formBuilder.group({
      titulo: ['', Validators.required],
      cantidad: [null, [Validators.required, Validators.min(0)]],
      esIngreso: [false],
      categoria: ['', Validators.required],
      fecha: [new Date().toISOString()],
      viajeId: ['', Validators.required],
      id: [0]
    });

    // Obtiene el ID del gasto desde los parámetros de la ruta
    this.gastoId = +this.route.snapshot.paramMap.get('id')!;

    // Se suscribe al estado del modo oscuro
    this.temaService.darkMode$.subscribe(isDark => {
      this.darkMode = isDark;
    });
  }

  // Carga los datos del gasto desde el servicio y los asigna al formulario
  cargarDatosGasto() {
    this.gastosService.obtenerGastoPorId(this.gastoId).subscribe({
      next: (gasto) => {
        this.viajeId = gasto.viajeId;
        this.gastoForm.patchValue({
          titulo: gasto.titulo,
          cantidad: gasto.cantidad,
          esIngreso: gasto.esIngreso,
          categoria: gasto.categoria,
          fecha: gasto.fecha,
          viajeId: gasto.viajeId,
          id: gasto.id
        });
      },
      error: async (err) => {
        console.error('Error al cargar el gasto:', err);
        // Muestra un mensaje de error si falla la carga
        await this.mostrarMensaje('Error al cargar los datos del gasto', 'danger');
      }
    });
  }

  // Muestra un mensaje tipo toast con un color específico
  async mostrarMensaje(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color: color
    });
    await toast.present();
  }

  // Envía los datos del formulario actualizados al servicio para guardar los cambios
  async actualizarGasto() {
    if (this.gastoForm.valid) {
      const gasto = {
        ...this.gastoForm.value,
        fecha: new Date().toISOString() // Actualiza la fecha al momento actual
      };

      this.gastosService.actualizarGasto(this.gastoId, gasto).subscribe({
        next: async () => {
          // Muestra mensaje de éxito y redirige al listado de gastos
          await this.mostrarMensaje('Gasto actualizado correctamente', 'success');
          this.router.navigate(['/gastos', this.viajeId]);
        },
        error: async (error) => {
          console.error('Error al actualizar el gasto:', error);
          // Muestra mensaje de error si falla la actualización
          await this.mostrarMensaje('Error al actualizar el gasto', 'danger');
        }
      });
    }
  }

  cancelar() {
    // Navigate back to the expenses list for this trip
    this.router.navigate(['/gastos', this.viajeId]);
  }
  // Método que se ejecuta al iniciar el componente, carga los datos del gasto
  ngOnInit() {
    this.cargarDatosGasto();
  }
}
