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

  tituloBillete: string = '';
  categoriaBillete: string = '';
  archivoPdf: File | null = null;

  nombreArchivoPdf: string | null = null;
  vistaPreviaPdfUrl: SafeResourceUrl | null = null;

  @Output() cancelarFormulario = new EventEmitter<void>();
  @Output() billeteGuardado = new EventEmitter<any>();

  constructor(private sanitizer: DomSanitizer, private http: HttpClient) {}

  ngOnInit() {}

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
    formData.append('nombre', this.tituloBillete);
    formData.append('categoria', this.categoriaBillete);
    formData.append('viajeId', '1'); // 🔁 Puedes reemplazar con el viajeId real
    formData.append('pdf', this.archivoPdf);

    this.http.post('http://localhost:8080/nuevo_billete', formData).subscribe({
      next: (respuesta) => {
        console.log('Billete guardado:', respuesta);
        this.billeteGuardado.emit(respuesta);
        this.limpiarFormulario();
      },
      error: (error) => {
        console.error('Error al guardar el billete:', error);
        alert('Ocurrió un error al guardar el billete.');
      }
    });
  }


  private limpiarFormulario(): void {
    this.tituloBillete = '';
    this.categoriaBillete = '';
    this.archivoPdf = null;
    this.nombreArchivoPdf = '';
  }
}
