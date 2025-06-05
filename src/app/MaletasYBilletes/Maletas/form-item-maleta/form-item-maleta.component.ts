import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption, IonToggle
} from "@ionic/angular/standalone";
import {FormsModule} from "@angular/forms";
import {CrearItemDTO} from "../../../Modelos/Maletas/Items/CrearItemDTO";
import {ItemsMaletaService} from "../../../Servicios/items-maleta.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-form-item-maleta',
  templateUrl: './form-item-maleta.component.html',
  styleUrls: ['./form-item-maleta.component.scss'],
  standalone: true,
  imports: [
    IonCard,
    IonIcon,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    FormsModule,
    IonSelect,
    IonSelectOption,
    IonButton
  ]
})
export class FormItemMaletaComponent  implements OnInit {

  @Output() cancelado  = new EventEmitter<void>();

  nombreObjeto: string = '';
  cantidadObjeto: number = 1;
  categoriaObjeto: string = '';
  isSelectedObjeto: boolean = false;
  maletaId: number = 0; // Asignar un valor por defecto o recibirlo como input

  constructor(private route: ActivatedRoute, private itemsmaletaservice: ItemsMaletaService ) { }

  ngOnInit() {
    const maletaId = this.route.snapshot.paramMap.get('id');
    this.maletaId = maletaId ? +maletaId : 0;

    console.log('Maleta ID desde ruta:', this.maletaId);
  }

  cancelar() {
    console.log('Operación cancelada');
    this.cancelado.emit();
    this.limpiarFormulario();
  }

  limpiarFormulario() {
    this.nombreObjeto = '';
    this.cantidadObjeto = 1;
    this.categoriaObjeto = '';
    this.isSelectedObjeto = false;
  }

  guardarObjeto() {
    if (this.nombreObjeto && this.categoriaObjeto && this.maletaId) {
      const nuevoObjeto: CrearItemDTO = {
        nombre: this.nombreObjeto,
        cantidad: this.cantidadObjeto,
        categoria: this.categoriaObjeto,
        isSelected: this.isSelectedObjeto,
        maletaId: this.maletaId
      };

      this.itemsmaletaservice.crearItemMaleta(nuevoObjeto).subscribe({
        next: (res) => {
          console.log('Objeto creado correctamente:', res);
          this.cancelado.emit();
          this.limpiarFormulario();
        },
        error: (error) => {
          console.error('Error al crear el objeto:', error);
        }
      });

    } else {
      console.error('Todos los campos son obligatorios');
      console.warn('Falta nombreObjeto:', this.nombreObjeto);
      console.warn('Falta categoriaObjeto:', this.categoriaObjeto);
      console.warn('Falta maletaId:', this.maletaId);
      console.warn('Falta cantidadObjeto:', this.cantidadObjeto);
      console.warn('Falta isSelectedObjeto:', this.isSelectedObjeto);
    }
  }
}
