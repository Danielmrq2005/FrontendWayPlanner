import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonText
} from "@ionic/angular/standalone";
import { FormsModule } from "@angular/forms";
import { NgIf } from "@angular/common";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {HttpClient} from "@angular/common/http";
import {Billete} from "../../../Modelos/Billete";
import {BilleteService} from "../../../Servicios/billete.service";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-form-billete',
  templateUrl: './form-billete.component.html',
  styleUrls: ['./form-billete.component.scss'],
  standalone: true,
  imports: [
    IonCard,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    FormsModule,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonIcon,
    IonText,
    NgIf
  ]
})
export class FormBilleteComponent implements OnInit {

  @Output() cancelado  = new EventEmitter<void>();

  viajeId: string | null = null;

  tituloBillete: string = '';
  categoriaBillete: string = '';
  archivoPdf: File | null = null;

  nombreArchivoPdf: string | null = null;
  vistaPreviaPdfUrl: SafeResourceUrl | null = null;


  // Billete
  billete: Billete = {
    nombre: '',
    categoria: '',
    pdf: '',
    viajeId: 0
  }

  @Output() cancelarFormulario = new EventEmitter<void>();
  @Output() billeteGuardado = new EventEmitter<any>();

  constructor(private route: ActivatedRoute, private sanitizer: DomSanitizer, private billeteService: BilleteService ) {}

  ngOnInit() {
    this.viajeId = this.route.snapshot.paramMap.get('id');
  }

  seleccionarArchivoPdf(): void {
    const input = document.getElementById('inputPdfBillete') as HTMLInputElement;
    if (input) {
      input.click();
    }
  }

  cargarPdf(event: any) {
    const archivo = event.target.files[0];
    if (archivo && archivo.type === 'application/pdf') {
      this.archivoPdf = archivo;
      this.nombreArchivoPdf = archivo.name;

      const archivoUrl = URL.createObjectURL(archivo);
      this.vistaPreviaPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(archivoUrl);
    } else {
      this.nombreArchivoPdf = null;
      this.vistaPreviaPdfUrl = null;
      alert('Por favor selecciona un archivo PDF válido.');
    }
  }


  cancelar(): void {
    console.log('Operación cancelada');
    this.limpiarFormulario();
    this.cancelado.emit();
  }

  guardarBillete(): void {
    if (!this.tituloBillete || !this.categoriaBillete || !this.archivoPdf) {
      alert('Por favor, completa todos los campos y añade un PDF.');
      return;
    }

    const formData = new FormData();

    this.billete.nombre = this.tituloBillete;
    this.billete.categoria = this.categoriaBillete;
    this.billete.pdf = this.archivoPdf.name;
    this.billete.viajeId = Number(this.viajeId);

    formData.append('billete', new Blob([JSON.stringify(this.billete)], { type: 'application/json' }));
    formData.append('pdf', this.archivoPdf);

    console.log('Datos del billete:', this.billete);

    this.billeteService.crearBillete(formData).subscribe({
      next: (response) => {
        console.log('Billete guardado exitosamente:', response);
        this.billeteGuardado.emit(response);
        this.limpiarFormulario();
      },
      error: (err) => {
        console.error('Error al guardar el billete:', err);
        alert('Error al guardar el billete. Por favor, inténtalo de nuevo.');
      },
      complete: () => {
        console.log('Proceso de guardado completado.');
        this.limpiarFormulario();
        this.cancelado.emit();
      }
    });
  }


  private limpiarFormulario(): void {
    this.tituloBillete = '';
    this.categoriaBillete = '';
    this.archivoPdf = null;
    this.nombreArchivoPdf = '';
    this.vistaPreviaPdfUrl = null;
  }
}
