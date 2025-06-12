import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormItemMaletaComponent} from "../../Maletas/form-item-maleta/form-item-maleta.component";
import {AlertController, IonicModule} from "@ionic/angular";
import {NgForOf, NgIf} from "@angular/common";
import {ActivatedRoute, RouterLink} from "@angular/router";
import {FormBilleteComponent} from "../form-billete/form-billete.component";
import {BilleteService} from "../../../Servicios/billete.service";
import {ListarBilletesDTO} from "../../../Modelos/Billetes/ListarBilletesDTO";
import {IonIcon} from "@ionic/angular/standalone";
import {FormEditarBilleteComponent} from "../form-editar-billete/form-editar-billete.component";
import {VerBilleteDTO} from "../../../Modelos/Billetes/VerBilleteDTO";
import {TemaService} from "../../../Servicios/tema.service";

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
    FormEditarBilleteComponent
  ]
})
export class ListaBilletesComponent  implements OnInit {

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

  constructor(private route: ActivatedRoute, private billeteService: BilleteService, private temaService: TemaService, private alertController: AlertController) {
    this.temaService.darkMode$.subscribe(isDark => {
      this.darkMode = isDark;
    });
  }

  ngOnInit() {
    this.cargarBilletes();
    this.tituloCategoria();
  }

  tituloCategoria() {
    const categoria = this.route.snapshot.paramMap.get('categoria');
    if (categoria) {
      if (categoria === 'OTRO') {
        this.billeteNombre = 'Otros Billetes';
      }
      this.billeteNombre = 'Billetes de ' + this.getNombreCategoria(categoria);
    }
    else {
      this.billeteNombre = 'Billetes';
    }
  }

  getNombreCategoria(nombre: string): string {
    switch (nombre?.toUpperCase()) {
      case 'AVION':
        return 'Aviones';
      case 'TREN':
        return 'Trenes';
      case 'AUTOBUS':
        return 'Autobuses';
      case 'BARCO':
        return 'Barco';
      case 'CONCIERTO':
        return 'Conciertos';
      case 'MUSEO':
        return 'Museos';
      case 'EVENTO':
        return 'Eventos';
      case 'OTRO':
      default:
        return 'Otro';
    }
  }

  getEmojiPorCategoria(nombre: string): string {
    switch (nombre?.toUpperCase()) {
      case 'AVION':
        return '✈️';
      case 'TREN':
        return '🚆';
      case 'AUTOBUS':
        return '🚌';
      case 'BARCO':
        return '🚢';
      case 'CONCIERTO':
        return '🎵';
      case 'MUSEO':
        return '🖼️';
      case 'EVENTO':
        return '🎫';
      case 'OTRO':
      default:
        return '❓';
    }
  }

  cargarBilletes() {
    this.route.paramMap.subscribe(params => {
      const viajeId = Number(this.route.snapshot.paramMap.get('id'));
      console.log('ID del viaje:', viajeId);
      const categoria = this.route.snapshot.paramMap.get('categoria');
      console.log('Categoría:', categoria);

      this.categoriaNombre = categoria || '';

      if (viajeId && categoria) {
        this.billeteService.getBilletesPorCategoriaYViaje(viajeId, categoria).subscribe({
          next: (data) => {
            this.billetes = data;
            console.log('Billetes cargados:', this.billetes);
          },
          error: (err) => {
            console.error('Error al cargar los billetes:', err);
          }
        });
      } else {
        console.error('Faltan parámetros en la ruta');
        console.log('viajeId:', viajeId);
        console.log('categoria:', categoria);
      }
    });
  }

  FormularioCancelado() {
    this.mostrarFormulario = false;
    this.mostrarListaBilletes = true;
  }

  verBillete(event: Event, billete: VerBilleteDTO) {
    event.stopPropagation();
    this.billeteSeleccionado = { ...billete };

    this.modoSoloLectura = true;
    this.mostrarFormularioEdicion = true;
    this.mostrarListaBilletes = false;
    this.viendoBillete.emit(true);

    console.log('Billete seleccionado para ver:', this.billeteSeleccionado);
  }

  editarBillete(event: Event, billete: VerBilleteDTO) {
    event.stopPropagation();
    this.billeteSeleccionado = { ...billete };

    this.modoSoloLectura = false;
    this.mostrarFormularioEdicion = true;
    this.mostrarListaBilletes = false;
    this.editandoBillete.emit(true);

    console.log('Billete seleccionado para edición:', this.billeteSeleccionado);
  }


  guardarEdicionBillete(billeteEditado: VerBilleteDTO | VerBilleteDTO[]) {
    const billete = Array.isArray(billeteEditado) ? billeteEditado[0] : billeteEditado;

    if (!billete?.id) {
      console.error('El billete editado no tiene un ID válido.');

      return;
    }

    this.cargarBilletes();
    this.billeteSeleccionado = null;
    this.editandoBillete.emit(false);
    this.mostrarFormularioEdicion = false;
    this.mostrarListaBilletes = true;
  }

  cancelarEdicionBillete() {
    this.billeteSeleccionado = null;
    this.mostrarFormularioEdicion = false;
    this.mostrarListaBilletes = true;
    this.editandoBillete.emit(false);
  }

  async eliminarBillete(billete: VerBilleteDTO) {
    if (!billete.id) {
      console.error('No se puede eliminar el billete: ID faltante');
      return;
    }

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
            this.billeteService.eliminarBillete(billete.id).subscribe({
              next: () => {
                this.billetes = this.billetes.filter(b => b.id !== billete.id);
                console.log(`Billete "${billete.nombre}" eliminado.`);
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
      cssClass: this.darkMode ? 'custom-alert dark-alert' : 'custom-alert'
    });

    await alert.present();
  }
}
