import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {AlertController, IonicModule} from "@ionic/angular";
import {NgForOf, NgIf} from "@angular/common";
import {ActivatedRoute, RouterLink} from "@angular/router";
import {MaletaService} from "../../../Servicios/maleta.service";
import {ListarObjetosMaletasDTO} from "../../../Modelos/Maletas/Items/ListarObjetosMaletasDTO";
import {ItemsMaletaService} from "../../../Servicios/items-maleta.service";
import {FormItemMaletaComponent} from "../form-item-maleta/form-item-maleta.component";

import { jsPDF } from 'jspdf';
import {VerItemDTO} from "../../../Modelos/Maletas/Items/VerItemDTO";
import {FormEditarObjetoMaletaComponent} from "../form-editar-objeto-maleta/form-editar-objeto-maleta.component";
import {TemaService} from "../../../Servicios/tema.service";

@Component({
    selector: 'app-lista-items-maleta',
    templateUrl: './lista-items-maleta.component.html',
    styleUrls: ['./lista-items-maleta.component.scss'],
    standalone: true,
  imports: [
    IonicModule,
    RouterLink,
    NgForOf,
    NgIf,
    FormItemMaletaComponent,
    FormEditarObjetoMaletaComponent
  ]
})
export class ListaItemsMaletaComponent implements OnInit {

  maletaNombre: string = '';  // Nombre de la maleta mostrada en la interfaz

  mostrarFormulario: boolean = false;  // Controla visibilidad formulario para agregar item
  mostrarListaItems: boolean = true;   // Controla visibilidad de la lista de items

  mostrarFormularioEdicion: boolean = false;  // Controla visibilidad formulario edición

  itemsMaleta: ListarObjetosMaletasDTO[] = [];  // Lista de items en la maleta

  itemSeleccionado: VerItemDTO | null = null;  // Item seleccionado para editar

  @Output() editandoItem = new EventEmitter<boolean>();  // Evento para comunicar si se está editando un item

  darkMode = false;  // Controla modo oscuro (tema)

  constructor(
    private route: ActivatedRoute,  // Para obtener parámetros de ruta (como ID)
    private maletaService: MaletaService,  // Servicio para obtener datos de la maleta
    private itemsMaletaService: ItemsMaletaService,  // Servicio para manejar items de maleta
    private temaService: TemaService,  // Servicio para detectar tema (claro/oscuro)
    private alertController: AlertController  // Controlador para mostrar alertas
  ) {
    // Se suscribe a cambios en el modo oscuro para actualizar el estado darkMode
    this.temaService.darkMode$.subscribe(isDark => {
      this.darkMode = isDark;
    });
  }

  ngOnInit() {
    // Obtener el ID de la maleta desde la URL
    const maletaId = this.route.snapshot.paramMap.get('id');

    if (maletaId) {
      // Consultar el servicio para obtener los datos de la maleta
      this.maletaService.getMaletaPorId(+maletaId).subscribe({
        next: (maleta) => {
          this.maletaNombre = maleta.nombre;  // Asignar nombre para mostrar
        },
        error: (err) => {
          console.error('Error al obtener la maleta:', err);
          this.maletaNombre = 'Desconocido';  // Valor por defecto si hay error
        }
      });
    }

    if (maletaId) {
      // Obtener lista de items asociados a la maleta
      this.itemsMaletaService.getItemsPorMaleta(+maletaId).subscribe({
        next: (data) => {
          this.itemsMaleta = data;
          console.log('Items de la maleta:', this.itemsMaleta);
        },
        error: (err) => {
          console.error('Error al obtener los items de la maleta:', err);
        }
      });
    } else {
      console.error('No se proporcionó un ID de maleta válido.');
    }
  }

  // Función llamado cuando se guarda un item nuevo
  alGuardarItem() {
    this.mostrarFormulario = false;  // Oculta formulario
    this.cargarItems();  // Recarga lista de items para mostrar cambios
  }

  // Función para recargar la lista de items desde el backend
  private cargarItems() {
    const maletaId = this.route.snapshot.paramMap.get('id');
    if (maletaId) {
      this.itemsMaletaService.getItemsPorMaleta(+maletaId).subscribe({
        next: (data) => {
          this.itemsMaleta = data;
        },
        error: (err) => {
          console.error('Error al obtener los items de la maleta:', err);
        }
      });
    }
  }

  // Función para seleccionar o deseleccionar un item (toggle)
  seleccionarItem(item: ListarObjetosMaletasDTO) {
    const nuevoValor = !item.isSelected;  // Nuevo estado invertido
    item.isSelected = nuevoValor;

    // Actualizar backend con nuevo estado seleccionado
    this.itemsMaletaService.actualizarItemMaleta(item.id, nuevoValor).subscribe({
      next: () => {
        console.log(`Item ${item.id} actualizado`);
        // Aquí se podría actualizar la lista si la API devuelve los items actualizados
      },
      error: (err) => {
        console.error('Error al actualizar item:', err);
        item.isSelected = !nuevoValor; // revertir cambio si hay error
      }
    });
  }

  // Incrementar la cantidad de un item
  masCantidad(item: any) {
    if (!item.cantidad) {
      item.cantidad = 1;
    }
    const nuevaCantidad = item.cantidad + 1;

    this.itemsMaletaService.cambiarCantidad(item.id, nuevaCantidad).subscribe({
      next: (nuevaLista) => {
        item.cantidad = nuevaCantidad;
        this.itemsMaleta = nuevaLista;  // Actualiza lista con respuesta del backend
      },
      error: (err) => {
        console.error('Error al actualizar la cantidad:', err);
      }
    });
  }

  // Disminuir la cantidad de un item, sin permitir bajar de 1
  menosCantidad(item: any) {
    if (!item.cantidad || item.cantidad <= 1) {
      return; // no permitir cantidades menores a 1
    }

    const nuevaCantidad = item.cantidad - 1;

    this.itemsMaletaService.cambiarCantidad(item.id, nuevaCantidad).subscribe({
      next: (nuevaLista) => {
        item.cantidad = nuevaCantidad;
        this.itemsMaleta = nuevaLista;
      },
      error: (err) => {
        console.error('Error al actualizar la cantidad:', err);
      }
    });
  }

  // Iniciar edición de categoría para un item (detiene propagación para evitar seleccionar el item)
  editarCategoria(event: Event, item: VerItemDTO) {
    event.stopPropagation();
    this.itemSeleccionado = { ...item };  // Clonar item para edición
    this.mostrarFormularioEdicion = true;
    this.mostrarListaItems = false;
    this.editandoItem.emit(true);  // Emitir evento que indica que se está editando

    console.log('Editar categoría de:', item);
  }

  // Cancelar edición o creación, vuelve a mostrar la lista
  FormularioCancelado() {
    this.mostrarFormulario = false;
    this.mostrarFormularioEdicion = false;
    this.mostrarListaItems = true;
  }

  // Obtener el nombre legible para cada categoría
  getNombreCategoria(nombre: string): string {
    switch (nombre?.toUpperCase()) {
      case 'ROPA':
        return 'Ropa';
      case 'ELECTRONICA':
        return 'Electrónica';
      case 'HIGIENE':
        return 'Higiene';
      case 'DOCUMENTOS':
        return 'Documentos';
      case 'ACCESORIOS':
        return 'Accesorios';
      default:
        return 'Otros';
    }
  }

  // Generar y descargar un PDF con la lista de objetos de la maleta
  exportarPDF() {
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = 30;

    // Fondo azul para encabezado
    doc.setFillColor(107, 161, 216);
    doc.rect(0, 0, pageWidth, 25, 'F');

    // Título de la maleta en blanco
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(`Maleta: ${this.maletaNombre}`, margin, 18);

    // Línea separadora bajo título
    doc.setDrawColor(107, 161, 216);
    doc.setLineWidth(1);
    doc.line(margin, 27, pageWidth - margin, 27);

    // Título sección lista de objetos
    y = 40;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text('Lista de Objetos:', margin, y);
    y += 10;

    // Encabezados de tabla con estilos
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');

    // Espacio para checkbox (vacío)
    doc.text('', margin + 4, y);

    // Otros encabezados
    doc.text('Nombre', margin + 20, y);
    doc.text('Cantidad', margin + 110, y, { align: 'center' });
    doc.text('Categoría', margin + 145, y);
    y += 5;

    // Línea debajo del encabezado
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 7;

    // Variables para centrar cantidad
    const cantidadColX = margin + 95;
    const cantidadColWidth = 30;
    const cantidadCenterX = cantidadColX + cantidadColWidth / 2;

    // Lista de items con checkbox vacío y cantidad centrada
    doc.setFont('helvetica', 'normal');
    const checkboxSize = 6;

    // Iterar items para añadirlos al PDF
    this.itemsMaleta.forEach((item) => {
      // Agregar página nueva si se llega al final
      if (y > 280) {
        doc.addPage();
        y = 20;
      }

      // Dibuja un cuadro vacío para el checkbox
      doc.rect(margin, y - checkboxSize + 3, checkboxSize, checkboxSize);

      // Añade nombre, cantidad y categoría del item
      doc.text(item.nombre, margin + 20, y);

      // Cantidad centrada
      doc.text((item.cantidad || 1).toString(), cantidadCenterX, y, { align: 'center' });

      // Categoría
      doc.text(this.getNombreCategoria(item.categoria), margin + 145, y);

      y += 10;
    });

    // Guarda el PDF con nombre de la maleta
    doc.save(`${this.maletaNombre || 'maleta'}.pdf`);
  }

  // Cancelar edición y regresar a vista lista
  cancelarEdicionItem() {
    this.itemSeleccionado = null;
    this.mostrarFormularioEdicion = false;
    this.mostrarListaItems = true;
    this.editandoItem.emit(false);
  }

  // Guardar cambios hechos al item editado
  guardarEdicionItem(itemEditado: VerItemDTO) {
    if (!itemEditado.id) {
      console.error('No se puede actualizar el item: ID faltante');
      return;
    }

    // Actualiza el item completo en backend y recarga lista
    this.itemsMaletaService.actualizarItemMaletaEntero(itemEditado.id, itemEditado).subscribe(() => {
      this.cargarItems();
      this.itemSeleccionado = null;
      this.editandoItem.emit(false);
      this.mostrarFormularioEdicion = false;
      this.mostrarListaItems = true;
    });
  }

  // Mostrar alerta para confirmar eliminación de un objeto
  async eliminarObjeto(item: VerItemDTO) {
    if (!item.id) return;

    const alert = await this.alertController.create({
      header: 'Eliminar objeto',
      message: `🗑️ ¿Eliminar "${item.nombre}" de la maleta? Esta acción es irreversible.`,
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
            // Si confirma, elimina el item del backend y actualiza lista local
            this.itemsMaletaService.eliminarItemMaleta(item.id!).subscribe({
              next: () => {
                this.itemsMaleta = this.itemsMaleta.filter(i => i.id !== item.id);
              },
              error: (err) => {
                console.error('Error al eliminar el item:', err);
              },
              complete: () => {
                console.log(`Objeto "${item.nombre}" eliminado de la maleta.`);

                this.mostrarFormularioEdicion = false;
                this.mostrarFormulario = false;
                this.mostrarListaItems = true;
                this.itemSeleccionado = null;
                this.editandoItem.emit(false);
              }
            });
          }
        }
      ],
      // Cambia estilos del alert según modo oscuro o claro
      cssClass: this.darkMode ? 'custom-alert dark-alert' : 'custom-alert'
    });

    await alert.present();  // Mostrar alerta al usuario
  }
}
