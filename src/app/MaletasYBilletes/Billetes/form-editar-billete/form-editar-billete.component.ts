import {Component, EventEmitter, Input, OnInit, Output, SimpleChanges} from '@angular/core';
import {
  IonButton,
  IonCard,
  IonCardContent, IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel, IonModal,
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

  // Recibe el billete a editar desde el componente padre
  @Input() billete!: VerBilleteDTO;

  // Emite eventos para notificar al componente padre sobre acciones
  @Output() EdicionCancelada = new EventEmitter<void>();
  @Output() EdicionActualizada = new EventEmitter<VerBilleteDTO>();

  // Emite un evento cuando se elimina un billete
  @Output() BilleteEliminado = new EventEmitter<VerBilleteDTO>();

  // Indica si el formulario es de solo lectura (para evitar ediciones)
  @Input() soloLectura: boolean = false;

  // Variables para almacenar los valores del formulario
  nombreBillete = '';
  categoriaBillete = '';
  pdfBillete: File | null = null;

  // Variables para manejar la vista previa del PDF
  nombreArchivoPdf: string | null = null;
  vistaPreviaPdfUrl: SafeResourceUrl | null = null;

  // Objeto para almacenar los datos del billete actualizado
  billeteActualizado: Billete = {
    nombre: '',
    categoria: '',
    pdf: '',
    viajeId: 0
  }

  constructor(private route: ActivatedRoute, private sanitizer: DomSanitizer, private billeteService: BilleteService) { }

  // Detecta cambios en las propiedades de entrada del componente
  ngOnInit() {
    // Si el billete ya está definido, establece los valores del formulario
    if (this.billete) {
      // Asigna los valores del billete recibido a las variables del formulario
      this.nombreBillete = this.billete.nombre;
      this.categoriaBillete = this.billete.categoria;

      // Se encarga de convertir el PDF en una URL segura para la vista previa
      this.setFormValues();
    }
  }

  // Detecta cambios en las propiedades de entrada del componente
  ngOnChanges(changes: SimpleChanges): void {
    // Si el billete cambia, actualiza los valores del formulario
    if (changes['billete'] && changes['billete'].currentValue) {
      // Asigna los valores del billete recibido a las variables del formulario
      this.setFormValues();
    }
  }

  // Verifica si el dispositivo es móvil
  isMobile(): boolean {
    // Utiliza el userAgent del navegador para detectar si es un dispositivo móvil
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  }

  // Selecciona el archivo PDF para cargarlo
  seleccionarArchivoPdf() {
    // Si el dispositivo es móvil, muestra un mensaje de advertencia
    const input = document.getElementById('inputPdfBillete') as HTMLInputElement;

    // Si el input existe, simula un clic para abrir el selector de archivos
    if (input) {
      input.click();
    }
  }

  // Carga el archivo PDF seleccionado
  cargarPdf(event: any) {
    // Obtiene el archivo seleccionado del evento
    const archivo = event.target.files[0];

    // Verifica si el archivo es un PDF
    if (archivo && archivo.type === 'application/pdf') {
      // Asigna el archivo PDF a la variable y actualiza el nombre del archivo
      this.pdfBillete = archivo;
      this.nombreArchivoPdf = archivo.name;

      // Crear una URL segura para la vista previa del PDF
      const fileReader = new FileReader();

      // Utiliza el FileReader para leer el archivo como Data URL
      fileReader.onload = () => {
        // Asigna la URL segura a la variable de vista previa del PDF
        this.vistaPreviaPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fileReader.result as string);
      };

      // Inicia la lectura del archivo como Data URL
      fileReader.readAsDataURL(archivo);
    } else { // Si el archivo no es un PDF válido
      // Muestra un mensaje de alerta al usuario
      alert('Por favor, selecciona un archivo PDF válido.');

      // Limpia las variables relacionadas con el PDF
      this.pdfBillete = null;
      this.nombreArchivoPdf = null;
      this.vistaPreviaPdfUrl = null;
    }
  }

  // Establece los valores del formulario a partir del billete recibido
  private setFormValues() {
    // Asigna los valores del billete a las variables del formulario
    this.nombreBillete = this.billete.nombre || '';
    this.categoriaBillete = this.billete.categoria || '';

    // Si el billete tiene un PDF
    if (this.billete.pdf) {
      // Convierte el PDF de base64 a una URL segura
      this.convertirBytesAPdf(this.billete.pdf);
    }
  }

  // Convierte un PDF en base64 a una URL segura para la vista previa
  private convertirBytesAPdf(base64: string) {
    // Decodifica el base64 y crea un array de bytes
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i));
    const byteArray = new Uint8Array(byteNumbers);

    // Crea un Blob a partir del array de bytes y genera una URL segura
    const blob = new Blob([byteArray], { type: 'application/pdf' });

    // Crea un objeto URL a partir del Blob y lo asigna a la variable de vista previa
    const url = URL.createObjectURL(blob);

    // Asigna la URL segura a la variable de vista previa del PDF
    this.vistaPreviaPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  // Guarda los cambios del billete editado
  guardarBillete() {
    // Verifica si los campos obligatorios están completos
    if (!this.nombreBillete || !this.categoriaBillete) {
      // Muestra un mensaje de alerta si faltan campos
      alert('Por favor completa todos los campos.');
      return;
    }

    // Crea un objeto FormData para enviar los datos del billete
    const formData = new FormData();

    // Agrega los datos del billete actualizado al FormData
    if (!this.pdfBillete && this.billete.pdf) { // Si no se ha seleccionado un nuevo PDF, pero ya existe uno
      // Asigna el PDF existente al billete actualizado
      this.billeteActualizado.pdf = this.billete.pdf;
    } else if (this.pdfBillete) { // Si se ha seleccionado un nuevo PDF
      // Asigna el nuevo PDF al billete actualizado
      this.billeteActualizado.pdf = this.pdfBillete.name;

      // Agrega el archivo PDF al FormData
      formData.append('pdf', this.pdfBillete);
    } else { // Si no se ha seleccionado un PDF y no hay uno existente
      // Muestra un mensaje de alerta al usuario
      alert('Por favor, añade un archivo PDF.');
      return;
    }

    // Asigna los valores del formulario al objeto billete actualizado
    this.billeteActualizado.nombre = this.nombreBillete;
    this.billeteActualizado.categoria = this.categoriaBillete;
    this.billeteActualizado.viajeId = this.billete.viajeId;

    // Agrega el objeto billete actualizado al FormData como JSON
    formData.append('billete', new Blob([JSON.stringify(this.billeteActualizado)], { type: 'application/json' }));

    // Imprime los datos del billete a guardar en la consola para depuración
    console.log('Datos del billete a guardar:', this.billeteActualizado);

    // Llama al servicio para actualizar el billete en el backend
    this.billeteService.actualizarBillete(this.billete.id, formData).subscribe({
      // Maneja la respuesta del servicio
      next: (response) => {
        // Imprime la respuesta del servidor en la consola
        console.log('Billete actualizado:', response);

        // Emite el evento de edición actualizada y limpia el formulario
        this.EdicionActualizada.emit(response);
        this.limpiarFormulario();
      },
      // Maneja errores en la actualización del billete
      error: (err) => {
        // Imprime el error en la consola y muestra un mensaje de alerta
        console.error('Error al actualizar el billete:', err);
        alert('Error al actualizar el billete. Por favor, inténtalo de nuevo.');
      },
      // Maneja la finalización del proceso de actualización
      complete: () => {
        // Imprime un mensaje de finalización en la consola
        console.log('Proceso de actualización completado.');

        // Limpia el formulario y emite el evento de edición cancelada
        this.limpiarFormulario();
        this.EdicionCancelada.emit();
      }
    });
  }

  // Cancela la edición del billete y emite un evento
  cancelar() {
    this.EdicionCancelada.emit();
  }

  // Limpia los valores del formulario después de guardar o cancelar
  private limpiarFormulario() {
    this.nombreBillete = '';
    this.categoriaBillete = '';
    this.pdfBillete = null;
    this.nombreArchivoPdf = null;
    this.vistaPreviaPdfUrl = null;
  }

  // Elimina el billete y emite un evento
  eliminarBillete() {
    this.BilleteEliminado.emit(this.billete);
  }

  // Descarga el PDF del billete
  descargarPdf() {
    // Verifica si el billete tiene un PDF disponible
    if (this.billete.pdf) {
      // Convierte el PDF de base64 a un Blob y crea un enlace para descargarlo
      const byteCharacters = atob(this.billete.pdf);
      const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i));
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      // Crea un enlace temporal para descargar el PDF
      const a = document.createElement('a');

      // Configura el enlace para descargar el PDF
      a.href = url;
      a.download = this.billete.nombre + '.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else { // Si no hay PDF disponible, muestra un mensaje de alerta
      alert('No hay PDF disponible para descargar.');
    }
  }
}
