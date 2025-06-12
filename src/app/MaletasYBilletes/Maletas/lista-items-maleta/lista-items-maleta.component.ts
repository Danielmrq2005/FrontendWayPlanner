import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {IonicModule} from "@ionic/angular";
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
export class ListaItemsMaletaComponent  implements OnInit {

  maletaNombre: string = '';

  mostrarFormulario: boolean = false;
  mostrarListaItems: boolean = true;

  mostrarFormularioEdicion: boolean = false;

  itemsMaleta: ListarObjetosMaletasDTO[] = [];

  itemSeleccionado: VerItemDTO | null = null;

  @Output() editandoItem = new EventEmitter<boolean>();

  darkMode = false;

  constructor(private route: ActivatedRoute, private maletaService: MaletaService, private itemsMaletaService: ItemsMaletaService, private temaService: TemaService) {
    this.temaService.darkMode$.subscribe(isDark => {
      this.darkMode = isDark;
    });
  }

  ngOnInit() {
    const maletaId = this.route.snapshot.paramMap.get('id');
    if (maletaId) {
      this.maletaService.getMaletaPorId(+maletaId).subscribe({
        next: (maleta) => {
          this.maletaNombre = maleta.nombre;
        },
        error: (err) => {
          console.error('Error al obtener la maleta:', err);
          this.maletaNombre = 'Desconocido';
        }
      });
    }

    if (maletaId) {
      this.itemsMaletaService.getItemsPorMaleta(+maletaId).subscribe({
        next: (data) => {
          this.itemsMaleta = data;
          console.log('Items de la maleta:', this.itemsMaleta);
        },
        error: (err) => {
          console.error('Error al obtener los items de la maleta:', err);
        }
      });
    }
    else {
      console.error('No se proporcionó un ID de maleta válido.');
    }
  }

  alGuardarItem() {
    this.mostrarFormulario = false;
    this.cargarItems();
  }

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


  // Selección de item
  seleccionarItem(item: ListarObjetosMaletasDTO) {
    const nuevoValor = !item.isSelected;
    item.isSelected = nuevoValor;

    this.itemsMaletaService.actualizarItemMaleta(item.id, nuevoValor).subscribe({
      next: (response) => {
        console.log(`Item ${item.id} actualizado`);
        // Puedes actualizar this.itemsMaleta si el backend devuelve la lista actualizada
        // this.itemsMaleta = response;
      },
      error: (err) => {
        console.error('Error al actualizar item:', err);
        item.isSelected = !nuevoValor; // revertir si falla
      }
    });
  }

  // Cantidad de items
  masCantidad(item: any) {
    if (!item.cantidad) {
      item.cantidad = 1;
    }
    const nuevaCantidad = item.cantidad + 1;

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

  menosCantidad(item: any) {
    if (!item.cantidad || item.cantidad <= 1) {
      return; // no permitir menor a 1
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

  editarCategoria(event: Event, item: VerItemDTO) {
    event.stopPropagation();
    this.itemSeleccionado = { ...item };
    this.mostrarFormularioEdicion = true;
    this.mostrarListaItems = false;
    this.editandoItem.emit(true);

    console.log('Editar categoría de:', item);
  }


  FormularioCancelado() {
    this.mostrarFormulario = false;
    this.mostrarFormularioEdicion = false;
    this.mostrarListaItems = true;
  }

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

  exportarPDF() {
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = 30;

    // Fondo encabezado azul
    doc.setFillColor(107, 161, 216);
    doc.rect(0, 0, pageWidth, 25, 'F');

    // Título maleta en blanco
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(`Maleta: ${this.maletaNombre}`, margin, 18);

    // Línea separadora debajo del título
    doc.setDrawColor(107, 161, 216);
    doc.setLineWidth(1);
    doc.line(margin, 27, pageWidth - margin, 27);

    // Título sección
    y = 40;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text('Lista de Objetos:', margin, y);
    y += 10;

    // Encabezados de tabla
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');

    // Solo el título de la columna de selección
    doc.text('', margin + 4, y);

    // Otros encabezados
    doc.text('Nombre', margin + 20, y);
    doc.text('Cantidad', margin + 110, y, { align: 'center' });
    doc.text('Categoría', margin + 145, y);
    y += 5;

    // Línea bajo encabezado
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 7;

    // Para centrar cantidad
    const cantidadColX = margin + 95;
    const cantidadColWidth = 30;
    const cantidadCenterX = cantidadColX + cantidadColWidth / 2;

    // Lista de items con checkbox vacío y cantidad centrada
    doc.setFont('helvetica', 'normal');
    const checkboxSize = 6;

    this.itemsMaleta.forEach((item) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }

      // Checkbox vacío (cuadrado)
      doc.rect(margin, y - checkboxSize + 3, checkboxSize, checkboxSize);

      // Nombre del item
      doc.text(item.nombre, margin + 20, y);

      // Cantidad centrada
      doc.text((item.cantidad || 1).toString(), cantidadCenterX, y, { align: 'center' });

      // Categoría
      doc.text(this.getNombreCategoria(item.categoria), margin + 145, y);

      y += 10;
    });

    // Guardar PDF con nombre de la maleta
    doc.save(`${this.maletaNombre || 'maleta'}.pdf`);
  }

  cancelarEdicionItem() {
    this.itemSeleccionado = null;
    this.mostrarFormularioEdicion = false;
    this.mostrarListaItems = true;
    this.editandoItem.emit(false);
  }

  guardarEdicionItem(itemEditado: VerItemDTO) {
    if (!itemEditado.id) {
      console.error('No se puede actualizar el item: ID faltante');
      return;
    }

    this.itemsMaletaService.actualizarItemMaletaEntero(itemEditado.id, itemEditado).subscribe(() => {
      this.cargarItems();
      this.itemSeleccionado = null;
      this.editandoItem.emit(false);
      this.mostrarFormularioEdicion = false;
      this.mostrarListaItems = true;
    });
  }
}
