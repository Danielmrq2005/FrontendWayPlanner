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

  // Evento que se emite cuando se cancela la acción
  @Output() cancelado  = new EventEmitter<void>();

  // Variables vinculadas a los campos del formulario
  tipoMaleta: string | null = null;  // Tipo de maleta seleccionada (null inicialmente)
  tituloMaleta: string = '';         // Título o nombre de la maleta
  pesoMaleta: number = 0;            // Peso de la maleta en kg
  viajeId: number | null = null;     // ID del viaje asociado, obtenido de la ruta

  // Inyección de dependencias: ActivatedRoute para parámetros y MaletaService para servicios
  constructor(private route: ActivatedRoute, private maletaService: MaletaService) {}

  // Función que se ejecuta al inicializar el componente
  ngOnInit() {
    // Obtiene el parámetro "id" de la URL (viajeId)
    const id = this.route.snapshot.paramMap.get('id');
    this.viajeId = id ? +id : null; // Convierte a número o asigna null si no existe

    console.log('Viaje ID desde ruta:', this.viajeId);
  }

  // Función para cancelar la creación/edición de la maleta
  cancelar() {
    console.log('Operación cancelada');
    this.tipoMaleta = null;  // Reinicia el tipo de maleta
    this.cancelado.emit();   // Emite evento para notificar al padre o componente superior
  }

  // Limpia todos los campos del formulario
  limpiarFormulario() {
    this.tipoMaleta = null;
    this.tituloMaleta = '';
    this.pesoMaleta = 0;
    this.viajeId = null;
    console.log('Formulario limpiado');
  }

  // Función para guardar la maleta, validando que los campos estén completos
  guardar() {
    // Verifica que tipoMaleta, tituloMaleta y viajeId estén definidos y no vacíos
    if (this.tipoMaleta && this.tituloMaleta && this.viajeId) {

      // Construye el objeto que se enviará al backend
      const nuevaMaleta: CrearMaletaDTO = {
        nombre: this.tituloMaleta,
        tipoMaleta: this.tipoMaleta,
        peso: this.pesoMaleta,
        viaje: this.viajeId
      };

      // Llama al servicio para crear la maleta, se subscribe para manejar respuesta asíncrona
      this.maletaService.crearMaleta(nuevaMaleta).subscribe({
        next: (res) => {
          console.log('Maleta creada correctamente:', res);
          this.cancelado.emit();  // Notifica que la operación terminó (podría cerrar modal, etc.)
          this.limpiarFormulario(); // Limpia el formulario tras éxito
        },
        error: (err) => {
          // En caso de error, muestra en consola
          console.error('Error al crear maleta:', err);
        }
      });

    } else {
      // En caso de faltar campos, muestra advertencias detalladas en consola
      console.warn('Completa todos los campos correctamente');
      console.warn('Falta tipoMaleta:', this.tipoMaleta);
      console.warn('Falta tituloMaleta:', this.tituloMaleta);
      console.warn('Falta viajeId:', this.viajeId);
    }
  }
}
