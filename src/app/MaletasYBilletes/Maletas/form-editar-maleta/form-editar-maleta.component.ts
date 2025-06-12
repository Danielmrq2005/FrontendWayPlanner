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
export class FormEditarMaletaComponent  implements OnInit {
  @Input() maleta!: VerMaletaDTO;
  @Output() EdicionCancelada = new EventEmitter<void>();
  @Output() EdicionActualizada = new EventEmitter<VerMaletaDTO>();

  @Output() MaletaEliminada = new EventEmitter<VerMaletaDTO>();

  tituloMaleta = '';
  tipoMaleta = '';
  pesoMaleta: number | null = null;

  ngOnInit() {
    if (this.maleta) {
      this.tituloMaleta = this.maleta.nombre;
      this.tipoMaleta = this.maleta.tipoMaleta;
      this.pesoMaleta = this.maleta.peso;
    }
  }

  guardar() {
    const maletaEditada: VerMaletaDTO = {
      ...this.maleta,
      nombre: this.tituloMaleta,
      tipoMaleta: this.tipoMaleta,
      peso: this.pesoMaleta ?? 0
    };
    this.EdicionActualizada.emit(maletaEditada);
  }

  cancelar() {
    this.EdicionCancelada.emit();
  }

  eliminarMaleta() {
    this.MaletaEliminada.emit(this.maleta);
  }
}
