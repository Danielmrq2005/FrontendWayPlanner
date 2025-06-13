import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonSelect, IonSelectOption
} from "@ionic/angular/standalone";
import {NgIf} from "@angular/common";
import {VerMaletaDTO} from "../../../Modelos/Maletas/ver-maleta-dto";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-form-editar-maleta',
  templateUrl: './form-editar-maleta.component.html',
  styleUrls: ['./form-editar-maleta.component.scss'],
  standalone: true,
  imports: [
    // Importación de componentes utilizados en el template HTML
    IonButton,
    IonCard,
    IonCardContent,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    NgIf,
    FormsModule
  ]
})
export class FormEditarMaletaComponent implements OnInit {
  // --- Inputs y Outputs ---

  /** Recibe una maleta para editar desde el componente padre */
  @Input() maleta!: VerMaletaDTO;

  /** Se emite cuando el usuario cancela la edición */
  @Output() EdicionCancelada = new EventEmitter<void>();

  /** Se emite cuando el usuario guarda los cambios */
  @Output() EdicionActualizada = new EventEmitter<VerMaletaDTO>();

  /** Se emite cuando el usuario decide eliminar la maleta */
  @Output() MaletaEliminada = new EventEmitter<VerMaletaDTO>();

  // --- Propiedades locales del formulario ---
  tituloMaleta = '';
  tipoMaleta = '';
  pesoMaleta: number | null = null;

  // --- Ciclo de vida ---

  /**
   * Inicializa los campos del formulario con los valores recibidos por @Input
   */
  ngOnInit() {
    if (this.maleta) {
      this.tituloMaleta = this.maleta.nombre;
      this.tipoMaleta = this.maleta.tipoMaleta;
      this.pesoMaleta = this.maleta.peso;
    }
  }

  // --- Acciones del formulario ---

  /**
   * Crea una nueva instancia de maleta con los datos actualizados
   * y emite el evento de edición actualizada.
   */
  guardar() {
    const maletaEditada: VerMaletaDTO = {
      ...this.maleta,
      nombre: this.tituloMaleta,
      tipoMaleta: this.tipoMaleta,
      peso: this.pesoMaleta ?? 0
    };

    this.EdicionActualizada.emit(maletaEditada);
  }

  /**
   * Emite un evento para cancelar la edición
   */
  cancelar() {
    this.EdicionCancelada.emit();
  }

  /**
   * Emite un evento indicando que la maleta debe eliminarse
   */
  eliminarMaleta() {
    this.MaletaEliminada.emit(this.maleta);
  }
}
