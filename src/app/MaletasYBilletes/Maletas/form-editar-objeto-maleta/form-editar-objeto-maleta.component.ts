import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption
} from "@ionic/angular/standalone";
import { FormsModule } from "@angular/forms";
import {VerItemDTO} from "../../../Modelos/Maletas/Items/VerItemDTO";

@Component({
  selector: 'app-form-editar-objeto-maleta',
  templateUrl: './form-editar-objeto-maleta.component.html',
  styleUrls: ['./form-editar-objeto-maleta.component.scss'],
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
    FormsModule
  ]
})
export class FormEditarObjetoMaletaComponent implements OnInit, OnChanges {
  @Input() item!: VerItemDTO;

  @Output() EdicionCancelada = new EventEmitter<void>();
  @Output() EdicionActualizada = new EventEmitter<VerItemDTO>();

  nombreObjeto = '';
  cantidadObjeto: number | null = null;
  categoriaObjeto = '';

  ngOnInit() {
    if (this.item) {
      this.nombreObjeto = this.item.nombre;
      this.cantidadObjeto = this.item.cantidad;
      this.categoriaObjeto = this.item.categoria;
      this.setFormValues();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['item'] && changes['item'].currentValue) {
      this.setFormValues();
    }
  }

  private setFormValues() {
    this.nombreObjeto = this.item.nombre || '';
    this.cantidadObjeto = this.item.cantidad ?? null;
    this.categoriaObjeto = this.item.categoria || '';
  }

  guardarObjeto() {
    const objetoEditado = {
      ...this.item,
      nombreObjeto: this.nombreObjeto,
      cantidadObjeto: this.cantidadObjeto ?? 1,
      categoriaObjeto: this.categoriaObjeto
    };
    this.EdicionActualizada.emit(objetoEditado);
  }

  cancelar() {
    this.EdicionCancelada.emit();
  }
}
