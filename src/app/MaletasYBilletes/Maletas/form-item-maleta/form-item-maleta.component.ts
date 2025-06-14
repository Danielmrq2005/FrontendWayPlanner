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
export class FormItemMaletaComponent implements OnInit {

  // Evento que se emite cuando se guarda correctamente un ítem
  @Output() itemGuardado = new EventEmitter<void>();

  // Evento que se emite cuando el usuario cancela la operación
  @Output() cancelado  = new EventEmitter<void>();

  // Campos del formulario
  nombreObjeto: string = '';             // Nombre del objeto (ej. "Zapatos")
  cantidadObjeto: number = 1;            // Cantidad (por defecto 1)
  categoriaObjeto: string = '';          // Categoría seleccionada del objeto
  isSelectedObjeto: boolean = false;     // Estado de selección (por defecto no seleccionado)
  maletaId: number = 0;                  // ID de la maleta donde se agregará el ítem

  // Constructor: se inyectan dependencias necesarias
  constructor(
    private route: ActivatedRoute,                // Para obtener parámetros de la URL
    private itemsmaletaservice: ItemsMaletaService // Servicio para crear ítems
  ) { }

  // Función que se ejecuta al inicializar el componente
  ngOnInit() {
    // Se obtiene el ID de la maleta desde la URL (como string), se convierte a número
    const maletaId = this.route.snapshot.paramMap.get('id');
    this.maletaId = maletaId ? +maletaId : 0;

    // Se imprime el ID de la maleta en consola (para depuración)
    console.log('Maleta ID desde ruta:', this.maletaId);
  }

  // Función que se ejecuta al hacer clic en "Cancelar"
  cancelar() {
    console.log('Operación cancelada');
    this.cancelado.emit();         // Emite el evento de cancelación al padre
    this.limpiarFormulario();      // Limpia los campos del formulario
  }

  // Función para reiniciar los valores del formulario
  limpiarFormulario() {
    this.nombreObjeto = '';
    this.cantidadObjeto = 1;
    this.categoriaObjeto = '';
    this.isSelectedObjeto = false;
  }

  // Función que se ejecuta al hacer clic en "Guardar"
  guardarObjeto() {
    // Verifica que los campos requeridos estén completos
    if (this.nombreObjeto && this.categoriaObjeto && this.maletaId) {

      // Crea un objeto DTO con los valores del formulario
      const nuevoObjeto: CrearItemDTO = {
        nombre: this.nombreObjeto,
        cantidad: this.cantidadObjeto,
        categoria: this.categoriaObjeto,
        isSelected: this.isSelectedObjeto,
        maletaId: this.maletaId
      };

      // Llama al servicio para crear el ítem en la maleta
      this.itemsmaletaservice.crearItemMaleta(nuevoObjeto).subscribe({
        next: (res) => {
          console.log('Objeto creado correctamente:', res);
          this.cancelado.emit();        // Emite evento de cancelación (puede cerrar el modal o similar)
          this.limpiarFormulario();     // Limpia el formulario
          this.itemGuardado.emit();     // Informa al padre que el ítem se ha guardado
        },
        error: (error) => {
          console.error('Error al crear el objeto:', error); // Manejo de error
        }
      });

    } else {
      // Si faltan campos requeridos, muestra advertencias en consola
      console.error('Todos los campos son obligatorios');
      console.warn('Falta nombreObjeto:', this.nombreObjeto);
      console.warn('Falta categoriaObjeto:', this.categoriaObjeto);
      console.warn('Falta maletaId:', this.maletaId);
      console.warn('Falta cantidadObjeto:', this.cantidadObjeto);
      console.warn('Falta isSelectedObjeto:', this.isSelectedObjeto);
    }
  }
}
