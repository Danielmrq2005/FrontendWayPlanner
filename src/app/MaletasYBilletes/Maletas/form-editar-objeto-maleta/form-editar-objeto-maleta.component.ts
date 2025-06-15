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
import {TemaService} from "../../../Servicios/tema.service";

// Decorador del componente Angular
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
  // Entrada: objeto a editar
  @Input() item!: VerItemDTO;

  // Eventos que el componente puede emitir al exterior (padre)
  @Output() EdicionCancelada = new EventEmitter<void>();
  @Output() EdicionActualizada = new EventEmitter<VerItemDTO>();
  @Output() ObjetoEliminado = new EventEmitter<VerItemDTO>();

  // Variables locales para vincular a los inputs del formulario
  nombreObjeto = '';
  cantidadObjeto: number | null = null;
  categoriaObjeto = '';

  // Inicialización: al cargar el componente
  darkMode = false;

  constructor(private temaService: TemaService) {
    this.temaService.darkMode$.subscribe(isDark => {
      this.darkMode = isDark;
    });
  }


  ngOnInit() {
    if (this.item) {
      this.nombreObjeto = this.item.nombre;
      this.cantidadObjeto = this.item.cantidad;
      this.categoriaObjeto = this.item.categoria;
      this.setFormValues(); // Asignación por método centralizado
    }
  }

  // Se ejecuta cuando cambia el valor del @Input() item
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['item'] && changes['item'].currentValue) {
      this.setFormValues(); // Reasigna valores si el ítem cambia
    }
  }

  // Función privado para centralizar la carga de datos del ítem al formulario
  private setFormValues() {
    this.nombreObjeto = this.item.nombre || '';
    this.cantidadObjeto = this.item.cantidad ?? null;
    this.categoriaObjeto = this.item.categoria || '';
  }

  // Crea un nuevo objeto editado y lo emite al componente padre
  guardarObjeto() {
    const objetoEditado = {
      ...this.item, // Mantiene el resto de propiedades del ítem original
      nombreObjeto: this.nombreObjeto,
      cantidadObjeto: this.cantidadObjeto ?? 1,
      categoriaObjeto: this.categoriaObjeto
    };
    this.EdicionActualizada.emit(objetoEditado); // Notifica al padre con el objeto actualizado
  }

  // Notifica al componente padre que se ha cancelado la edición
  cancelar() {
    this.EdicionCancelada.emit();
  }

  // Notifica al componente padre que se desea eliminar el objeto
  eliminarObjeto() {
    this.ObjetoEliminado.emit(this.item);
  }
}
