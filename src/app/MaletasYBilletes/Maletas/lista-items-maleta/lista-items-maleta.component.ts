import { Component, OnInit } from '@angular/core';
import {IonicModule} from "@ionic/angular";
import {ListaGruposBilletesComponent} from "../../Billetes/lista-grupos-billetes/lista-grupos-billetes.component";
import {ListaMaletasComponent} from "../lista-maletas/lista-maletas.component";
import {NgForOf, NgIf} from "@angular/common";
import {ActivatedRoute, RouterLink} from "@angular/router";
import {MaletaService} from "../../../Servicios/maleta.service";
import {ListarObjetosMaletasDTO} from "../../../Modelos/Maletas/Items/ListarObjetosMaletasDTO";
import {ItemsMaletaService} from "../../../Servicios/items-maleta.service";
import {FormItemMaletaComponent} from "../form-item-maleta/form-item-maleta.component";

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
    FormItemMaletaComponent
  ]
})
export class ListaItemsMaletaComponent  implements OnInit {

  maletaNombre: string = '';

  mostrarFormulario: boolean = false;
  mostrarListaItems: boolean = true;

  itemsMaleta: ListarObjetosMaletasDTO[] = [];

  constructor(private route: ActivatedRoute, private maletaService: MaletaService, private itemsMaletaService: ItemsMaletaService) { }

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

  editarCategoria(item: any) {
    // Aquí pones la lógica para editar la categoría, por ejemplo abrir un modal o formulario
    console.log('Editar categoría de:', item);
  }


  FormularioCancelado() {
    this.mostrarFormulario = false;
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
}
