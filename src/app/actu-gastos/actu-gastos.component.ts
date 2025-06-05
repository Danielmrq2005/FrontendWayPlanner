import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {GastosService} from "../Servicios/gastos.service";
import {IonicModule, ToastController} from "@ionic/angular";
import {ActivatedRoute, Router} from "@angular/router";
import {Gastos} from "../Modelos/Gastos";
import {HttpClient} from "@angular/common/http";
import {TemaService} from "../Servicios/tema.service";


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
    this.gastoForm = this.formBuilder.group({
      titulo: ['', Validators.required],
      cantidad: [null, [Validators.required, Validators.min(0)]],
      esIngreso: [false],
      categoria: ['', Validators.required],
      fecha: [new Date().toISOString()],
      viajeId: ['', Validators.required],
      id: [0]
    });
    this.gastoId = +this.route.snapshot.paramMap.get('id')!;
    this.temaService.darkMode$.subscribe(isDark => {
      this.darkMode = isDark;
    });
  }

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
        await this.mostrarMensaje('Error al cargar los datos del gasto', 'danger');
      }
    });
  }

  async mostrarMensaje(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color: color
    });
    await toast.present();
  }

  async actualizarGasto() {
    if (this.gastoForm.valid) {
      const gasto = {
        ...this.gastoForm.value,
        fecha: new Date().toISOString()
      };

      this.gastosService.actualizarGasto(this.gastoId, gasto).subscribe({
        next: async () => {
          await this.mostrarMensaje('Gasto actualizado correctamente', 'success');
          this.router.navigate(['/gastos', this.viajeId]);
        },
        error: async (error) => {
          console.error('Error al actualizar el gasto:', error);
          await this.mostrarMensaje('Error al actualizar el gasto', 'danger');
        }
      });
    }
  }

  ngOnInit() {
    this.cargarDatosGasto();
  }
}
