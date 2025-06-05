import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {
  IonButton,
  IonCard,
  IonCardContent, IonIcon, IonInput,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption
} from "@ionic/angular/standalone";
import { FormsModule } from "@angular/forms";
import {NgIf} from "@angular/common";
import {CrearMaletaDTO} from "../../../Modelos/Maletas/crear-maleta-dto";
import {MaletaService} from "../../../Servicios/maleta.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-form-maleta',
  templateUrl: './form-maleta.component.html',
  styleUrls: ['./form-maleta.component.scss'],
  standalone: true,
  imports: [
    IonCard,
    IonCardContent,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonButton,
    FormsModule,
    IonIcon,
    IonInput,
    NgIf
  ]
})
export class FormMaletaComponent implements OnInit {

  @Output() cancelado  = new EventEmitter<void>();

  tipoMaleta: string | null = null;
  tituloMaleta: string = '';
  pesoMaleta: number = 0;
  viajeId: number | null = null;

  constructor(private route: ActivatedRoute, private maletaService: MaletaService) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.viajeId = id ? +id : null;

    console.log('Viaje ID desde ruta:', this.viajeId);
  }

  cancelar() {
    console.log('Operación cancelada');
    this.tipoMaleta = null;
    this.cancelado.emit();
  }

  limpiarFormulario() {
    this.tipoMaleta = null;
    this.tituloMaleta = '';
    this.pesoMaleta = 0;
    this.viajeId = null;
    console.log('Formulario limpiado');
  }

  guardar() {
    if (this.tipoMaleta && this.tituloMaleta && this.viajeId) {
      const nuevaMaleta: CrearMaletaDTO = {
        nombre: this.tituloMaleta,
        tipoMaleta: this.tipoMaleta,
        peso: this.pesoMaleta,
        viaje: this.viajeId
      };

      this.maletaService.crearMaleta(nuevaMaleta).subscribe({
        next: (res) => {
          console.log('Maleta creada correctamente:', res);
          this.cancelado.emit();
          this.limpiarFormulario();
        },
        error: (err) => {
          console.error('Error al crear maleta:', err);
        }
      });

    } else {
      console.warn('Completa todos los campos correctamente');
      console.warn('Falta tipoMaleta:', this.tipoMaleta);
      console.warn('Falta tituloMaleta:', this.tituloMaleta);
      console.warn('Falta viajeId:', this.viajeId);
    }
  }
}
