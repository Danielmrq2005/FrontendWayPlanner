import {Component, EventEmitter, Input, OnInit, Output, SimpleChanges} from '@angular/core';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonSelect, IonSelectOption, IonText
} from "@ionic/angular/standalone";
import {NgIf} from "@angular/common";
import {VerItemDTO} from "../../../Modelos/Maletas/Items/VerItemDTO";
import {VerBilleteDTO} from "../../../Modelos/Billetes/VerBilleteDTO";
import {FormsModule} from "@angular/forms";
import {Billete} from "../../../Modelos/Billete";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {ActivatedRoute} from "@angular/router";
import {BilleteService} from "../../../Servicios/billete.service";
import {TemaService} from "../../../Servicios/tema.service";

@Component({
  selector: 'app-form-editar-billete',
  templateUrl: './form-editar-billete.component.html',
  styleUrls: ['./form-editar-billete.component.scss'],
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
    IonText,
    NgIf,
    FormsModule
  ]
})
export class FormEditarBilleteComponent  implements OnInit {

  @Input() billete!: VerBilleteDTO;

  @Output() EdicionCancelada = new EventEmitter<void>();
  @Output() EdicionActualizada = new EventEmitter<VerBilleteDTO>();

  @Output() BilleteEliminado = new EventEmitter<VerBilleteDTO>();

  nombreBillete = '';
  categoriaBillete = '';
  pdfBillete: File | null = null;

  nombreArchivoPdf: string | null = null;
  vistaPreviaPdfUrl: SafeResourceUrl | null = null;

  darkMode = false;

  billeteActualizado: Billete = {
    nombre: '',
    categoria: '',
    pdf: '',
    viajeId: 0
  }

  constructor(private route: ActivatedRoute, private sanitizer: DomSanitizer, private billeteService: BilleteService, private temaSarvice: TemaService) {
    this.temaSarvice.darkMode$.subscribe(isDark => {
      this.darkMode = isDark;
    });
  }


  ngOnInit() {
    if (this.billete) {
      this.nombreBillete = this.billete.nombre;
      this.categoriaBillete = this.billete.categoria;
      this.setFormValues();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['billete'] && changes['billete'].currentValue) {
      this.setFormValues();
    }
  }

  seleccionarArchivoPdf() {
    const input = document.getElementById('inputPdfBillete') as HTMLInputElement;
    if (input) {
      input.click();
    }
  }

  cargarPdf(event: any) {
    const archivo = event.target.files[0];
    if (archivo && archivo.type === 'application/pdf') {
      this.pdfBillete = archivo;
      this.nombreArchivoPdf = archivo.name;

      // Crear una URL segura para la vista previa del PDF
      const fileReader = new FileReader();
      fileReader.onload = () => {
        this.vistaPreviaPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fileReader.result as string);
      };
      fileReader.readAsDataURL(archivo);
    } else {
      alert('Por favor, selecciona un archivo PDF válido.');
      this.pdfBillete = null;
      this.nombreArchivoPdf = null;
      this.vistaPreviaPdfUrl = null;
    }
  }

  private setFormValues() {
    this.nombreBillete = this.billete.nombre || '';
    this.categoriaBillete = this.billete.categoria || '';

    if (this.billete.pdf) {
      this.convertirBytesAPdf(this.billete.pdf);
    }
  }

  private convertirBytesAPdf(base64: string) {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i));
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    this.vistaPreviaPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  guardarBillete() {
    if (!this.nombreBillete || !this.categoriaBillete) {
      alert('Por favor completa todos los campos.');
      return;
    }

    const formData = new FormData();

    // Use the existing PDF if no new file is selected
    if (!this.pdfBillete && this.billete.pdf) {
      this.billeteActualizado.pdf = this.billete.pdf;
    } else if (this.pdfBillete) {
      this.billeteActualizado.pdf = this.pdfBillete.name;
      formData.append('pdf', this.pdfBillete);
    } else {
      alert('Por favor, añade un archivo PDF.');
      return;
    }

    this.billeteActualizado.nombre = this.nombreBillete;
    this.billeteActualizado.categoria = this.categoriaBillete;
    this.billeteActualizado.viajeId = this.billete.viajeId;

    formData.append('billete', new Blob([JSON.stringify(this.billeteActualizado)], { type: 'application/json' }));

    console.log('Datos del billete a guardar:', this.billeteActualizado);

    this.billeteService.actualizarBillete(this.billete.id, formData).subscribe({
      next: (response) => {
        console.log('Billete actualizado:', response);
        this.EdicionActualizada.emit(response);
        this.limpiarFormulario();
      },
      error: (err) => {
        console.error('Error al actualizar el billete:', err);
        alert('Error al actualizar el billete. Por favor, inténtalo de nuevo.');
      },
      complete: () => {
        console.log('Proceso de actualización completado.');
        this.limpiarFormulario();
        this.EdicionCancelada.emit();
      }
    });
  }

  cancelar() {
    this.EdicionCancelada.emit();
  }

  private limpiarFormulario() {
    this.nombreBillete = '';
    this.categoriaBillete = '';
    this.pdfBillete = null;
    this.nombreArchivoPdf = null;
    this.vistaPreviaPdfUrl = null;
  }

  eliminarBillete() {
    this.BilleteEliminado.emit(this.billete);
  }
}
