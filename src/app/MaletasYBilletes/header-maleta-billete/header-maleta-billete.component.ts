import { Component, OnInit } from '@angular/core';
import {
  IonHeader,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar
} from "@ionic/angular/standalone";
import { FormsModule } from "@angular/forms";
import { CommonModule } from '@angular/common';

import { ListaMaletasComponent } from '../Maletas/lista-maletas/lista-maletas.component';
import { ListaGruposBilletesComponent } from '../Billetes/lista-grupos-billetes/lista-grupos-billetes.component';
import { FormMaletaComponent } from '../Maletas/form-maleta/form-maleta.component';
import { FormBilleteComponent } from '../Billetes/form-billete/form-billete.component';

import { IonicModule } from "@ionic/angular";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { ViajeService } from "../../Servicios/viaje.service";
import {MenuHamburguesaComponent} from "../../menu-hamburguesa/menu-hamburguesa.component";
import {TemaService} from "../../Servicios/tema.service";

@Component({
  selector: 'app-header-maleta-billete',
  templateUrl: './header-maleta-billete.component.html',
  styleUrls: ['./header-maleta-billete.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ListaMaletasComponent,
    ListaGruposBilletesComponent,
    IonicModule,
    RouterLink,
    FormBilleteComponent,
    FormMaletaComponent,
    MenuHamburguesaComponent
  ]
})
export class HeaderMaletaBilleteComponent implements OnInit {

  viajeNombre: string = '';
  segmento_seleccionado: string = 'lista_maletas';

  viajeId: number = 0;


  mostrarFormularioMaleta: boolean = false;
  mostrarFormularioBillete: boolean = false;

  mostrarListaMaletas: boolean = true;
  mostrarListaBilletes: boolean = true;

  estaEditandoMaleta: boolean = false;
  estaEditandoBillete: boolean = false;

  darkMode = false;
  sidebarExpanded = false;

  constructor(private route: ActivatedRoute, private viajeService: ViajeService, private temaService: TemaService) {
    this.temaService.darkMode$.subscribe(isDark => {
      this.darkMode = isDark;
    });
  }

  toggleSidebar() {
    this.sidebarExpanded = !this.sidebarExpanded;
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.viajeService.viajePorId(+id).subscribe({
        next: (viaje) => {
          this.viajeNombre = viaje.nombre;
        },
        error: (err) => {
          console.error('Error al obtener el viaje:', err);
          this.viajeNombre = 'Desconocido';
        }
      });
    }
  }

  Segmento_cambiado(event: any) {
    this.segmento_seleccionado = event.detail.value;

    // Ocultar formularios y mostrar listas al cambiar de segmento
    this.mostrarFormularioMaleta = false;
    this.mostrarFormularioBillete = false;

    this.mostrarListaMaletas = true;
    this.mostrarListaBilletes = true;
  }

  mostrarFormulario() {
    if (this.segmento_seleccionado === 'lista_maletas') {
      if (!this.mostrarFormularioMaleta) {
        this.mostrarFormularioMaleta = true;
        this.mostrarListaMaletas = false;
      }
    } else if (this.segmento_seleccionado === 'lista_grupos_billetes') {
      if (!this.mostrarFormularioBillete) {
        this.mostrarFormularioBillete = true;
        this.mostrarListaBilletes = false;
      }
    }
  }

  cancelarFormularioMaleta() {
    this.mostrarFormularioMaleta = false;
    this.mostrarListaMaletas = true;
  }

  cancelarFormularioBillete() {
    this.mostrarFormularioBillete = false;
    this.mostrarListaBilletes = true;
  }

  cargarGruposBilletes() {
    this.mostrarListaBilletes = false;
    setTimeout(() => {
      this.mostrarListaBilletes = true;
    });
  }

}
