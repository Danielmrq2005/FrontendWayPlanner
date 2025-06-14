import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormItemMaletaComponent} from "../../Maletas/form-item-maleta/form-item-maleta.component";
import {AlertController, IonicModule} from "@ionic/angular";
import {NgForOf, NgIf} from "@angular/common";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {FormBilleteComponent} from "../form-billete/form-billete.component";
import {BilleteService} from "../../../Servicios/billete.service";
import {ListarBilletesDTO} from "../../../Modelos/Billetes/ListarBilletesDTO";
import {IonIcon} from "@ionic/angular/standalone";
import {FormEditarBilleteComponent} from "../form-editar-billete/form-editar-billete.component";
import {VerBilleteDTO} from "../../../Modelos/Billetes/VerBilleteDTO";
import {TemaService} from "../../../Servicios/tema.service";
import {MenuHamburguesaComponent} from "../../../menu-hamburguesa/menu-hamburguesa.component";

@Component({
  selector: 'app-lista-billetes',
  templateUrl: './lista-billetes.component.html',
  styleUrls: ['./lista-billetes.component.scss'],
  standalone: true,
    imports: [
        IonicModule,
        NgForOf,
        NgIf,
        RouterLink,
        FormBilleteComponent,
        FormEditarBilleteComponent,
        MenuHamburguesaComponent
    ]
})
export class ListaBilletesComponent implements OnInit {

  categoriaNombre: string = '';
  billeteNombre: string = '';
  billetes: ListarBilletesDTO[] = [];

  mostrarFormulario: boolean = false;
  mostrarListaBilletes: boolean = true;
  mostrarFormularioEdicion: boolean = false;

  billeteSeleccionado: VerBilleteDTO | null = null;
  modoSoloLectura = false;

  @Output() editandoBillete = new EventEmitter<boolean>();
  @Output() viendoBillete = new EventEmitter<boolean>();

  darkMode = false;


  viajeId: number = 0;
  sidebarExpanded = false;

  // Alterna la expansión del menú hamburguesa
  toggleSidebar() {
    this.sidebarExpanded = !this.sidebarExpanded;
  }

  constructor(
    private route: ActivatedRoute,
    private billeteService: BilleteService,
    private temaService: TemaService,
    private alertController: AlertController,
    private router: Router
  ) {
    // Escuchar cambios en el modo oscuro y actualizar variable local
    this.temaService.darkMode$.subscribe(isDark => {
      this.darkMode = isDark;
    });
  }

  ngOnInit() {
    // Cargar la lista de billetes al iniciar el componente
    this.cargarBilletes();
    // Definir el título de la categoría según parámetro en URL
    this.tituloCategoria();
  }

  /** Establece el título del apartado billetes según la categoría de la ruta */
  tituloCategoria() {
    const categoria = this.route.snapshot.paramMap.get('categoria');

    if (categoria) {
      // Caso especial para categoría 'OTRO'
      if (categoria === 'OTRO') {
        this.billeteNombre = 'Otros Billetes';
      }
      // Si no, muestra título con el nombre de la categoría traducido
      this.billeteNombre = 'Billetes de ' + this.getNombreCategoria(categoria);
    } else {
      // Si no hay categoría en ruta, título genérico
      this.billeteNombre = 'Billetes';
    }
  }

  /** Devuelve el nombre legible de la categoría dada (en mayúsculas) */
  getNombreCategoria(nombre: string): string {
    switch (nombre?.toUpperCase()) {
      case 'AVION': return 'Aviones';
      case 'TREN': return 'Trenes';
      case 'AUTOBUS': return 'Autobuses';
      case 'BARCO': return 'Barco';
      case 'CONCIERTO': return 'Conciertos';
      case 'MUSEO': return 'Museos';
      case 'EVENTO': return 'Eventos';
      case 'OTRO':
      default: return 'Otro';
    }
  }

  /** Devuelve un emoji representativo según la categoría */
  getEmojiPorCategoria(nombre: string): string {
    switch (nombre?.toUpperCase()) {
      case 'AVION': return '✈️';
      case 'TREN': return '🚆';
      case 'AUTOBUS': return '🚌';
      case 'BARCO': return '🚢';
      case 'CONCIERTO': return '🎵';
      case 'MUSEO': return '🖼️';
      case 'EVENTO': return '🎫';
      case 'OTRO':
      default: return '❓';
    }
  }

  /**
   * Carga los billetes según el viaje y la categoría extraídos de la URL.
   * Se suscribe a cambios en los parámetros de la ruta.
   */
  cargarBilletes() {
    this.route.paramMap.subscribe(params => {
      // Obtener el ID del viaje y la categoría de la URL
      const viajeId = Number(this.route.snapshot.paramMap.get('id'));
      const categoria = this.route.snapshot.paramMap.get('categoria');

      // Guardar categoría en variable local
      this.categoriaNombre = categoria || '';

      if (viajeId && categoria) {
        // Solicitar al servicio los billetes para ese viaje y categoría
        this.billeteService.getBilletesPorCategoriaYViaje(viajeId, categoria).subscribe({
          next: (data) => {
            // Guardar billetes recibidos en el arreglo local
            this.billetes = data;
          },
          error: (err) => {
            // Mostrar error en consola si falla la petición
            console.error('Error al cargar los billetes:', err);
          }
        });
      } else {
        // Informar si faltan parámetros para cargar billetes
        console.error('Faltan parámetros en la ruta');
      }
    });
  }

  volver() {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.router.navigateByUrl(returnUrl);
  }

  /** Oculta el formulario y vuelve a mostrar la lista de billetes */
  FormularioCancelado() {
    this.mostrarFormulario = false;
    this.mostrarListaBilletes = true;
  }

  /**
   * Muestra el formulario en modo solo lectura para ver un billete.
   * @param event evento para evitar propagación (click)
   * @param billete billete seleccionado para ver
   */
  verBillete(event: Event, billete: VerBilleteDTO) {
    event.stopPropagation();
    // Clonar billete seleccionado para mostrar detalles
    this.billeteSeleccionado = { ...billete };

    // Configurar vista para solo lectura y mostrar formulario edición
    this.modoSoloLectura = true;
    this.mostrarFormularioEdicion = true;
    this.mostrarListaBilletes = false;

    // Emitir evento indicando que se está viendo un billete
    this.viendoBillete.emit(true);
  }

  /**
   * Prepara el formulario para editar un billete.
   * @param event evento para evitar propagación (click)
   * @param billete billete seleccionado para editar
   */
  editarBillete(event: Event, billete: VerBilleteDTO) {
    event.stopPropagation();
    // Clonar billete seleccionado para edición
    this.billeteSeleccionado = { ...billete };

    // Configurar vista para edición y mostrar formulario edición
    this.modoSoloLectura = false;
    this.mostrarFormularioEdicion = true;
    this.mostrarListaBilletes = false;

    // Emitir evento indicando que se está editando un billete
    this.editandoBillete.emit(true);
  }

  /**
   * Guardar cambios realizados en un billete editado.
   * Actualiza la lista de billetes y restablece vista principal.
   * @param billeteEditado billete o arreglo con billete editado
   */
  guardarEdicionBillete(billeteEditado: VerBilleteDTO | VerBilleteDTO[]) {
    // Si viene un arreglo, tomar el primer elemento
    const billete = Array.isArray(billeteEditado) ? billeteEditado[0] : billeteEditado;

    // Validar que el billete tenga un ID válido
    if (!billete?.id) {
      console.error('El billete editado no tiene un ID válido.');
      return;
    }

    // Recargar billetes para reflejar cambios
    this.cargarBilletes();

    // Limpiar billete seleccionado y cerrar formulario edición
    this.billeteSeleccionado = null;
    this.editandoBillete.emit(false);
    this.mostrarFormularioEdicion = false;
    this.mostrarListaBilletes = true;
  }

  /** Cancelar la edición de un billete y regresar a la lista */
  cancelarEdicionBillete() {
    this.billeteSeleccionado = null;
    this.mostrarFormularioEdicion = false;
    this.mostrarListaBilletes = true;
    this.editandoBillete.emit(false);
  }

  /**
   * Solicita confirmación para eliminar un billete.
   * Si se confirma, elimina el billete y actualiza la lista.
   * @param billete billete a eliminar
   */
  async eliminarBillete(billete: VerBilleteDTO) {
    if (!billete.id) {
      console.error('No se puede eliminar el billete: ID faltante');
      return;
    }

    // Crear alerta de confirmación con opciones Cancelar / Sí eliminar
    const alert = await this.alertController.create({
      header: 'Eliminar Billete',
      message: `🗑️ ¿Eliminar "${billete.nombre}"? Esta acción es irreversible.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'alert-cancel-button'
        },
        {
          text: 'Sí, eliminar',
          role: 'destructive',
          cssClass: 'alert-danger-button',
          handler: () => {
            // Llamar al servicio para eliminar el billete
            this.billeteService.eliminarBillete(billete.id).subscribe({
              next: () => {
                // Actualizar lista removiendo el billete eliminado
                this.billetes = this.billetes.filter(b => b.id !== billete.id);
                this.billeteSeleccionado = null;
                this.editandoBillete.emit(false);
                this.mostrarListaBilletes = true;
                this.mostrarFormularioEdicion = false;
              },
              error: (err) => {
                console.error('Error al eliminar el billete:', err);
              }
            });
          }
        }
      ],
      // Aplicar tema oscuro si está activo
      cssClass: this.darkMode ? 'custom-alert dark-alert' : 'custom-alert'
    });

    // Mostrar alerta al usuario
    await alert.present();
  }
}
