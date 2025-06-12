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

  // Evento de cancelar
  @Output() cancelado  = new EventEmitter<void>();

  // Variable para almacenar el ID del viaje
  viajeId: string | null = null;

  // Variables para el formulario
  tituloBillete: string = '';
  categoriaBillete: string = '';
  archivoPdf: File | null = null;

  // Variables para la vista previa del PDF
  nombreArchivoPdf: string | null = null;
  vistaPreviaPdfUrl: SafeResourceUrl | null = null;


  // Billete
  billete: Billete = {
    nombre: '',
    categoria: '',
    pdf: '',
    viajeId: 0
  }

  // Evento para emitir cuando se guarda un billete
  @Output() cancelarFormulario = new EventEmitter<void>();
  @Output() billeteGuardado = new EventEmitter<any>();

  constructor(private route: ActivatedRoute, private sanitizer: DomSanitizer, private billeteService: BilleteService ) {}

  // Función que se ejecuta al inicializar el componente
  ngOnInit() {
    // Obtener el ID del viaje desde la ruta activa
    this.viajeId = this.route.snapshot.paramMap.get('id');
  }

  // Función para seleccionar un archivo PDF
  seleccionarArchivoPdf(): void {
    // Crear un elemento de entrada de tipo archivo y simular un clic para abrir el selector de archivos
    const input = document.getElementById('inputPdfBillete') as HTMLInputElement;

    // Verificar si el elemento existe antes de intentar hacer clic
    if (input) {
      input.click();
    }
  }

  // Función para manejar el evento de carga del archivo PDF
  cargarPdf(event: any) {
    // Obtener el archivo seleccionado
    const archivo = event.target.files[0];

    // Verificar si se ha seleccionado un archivo y si es un PDF
    if (archivo && archivo.type === 'application/pdf') {
      // Asignar el archivo a la variable archivoPdf y establecer el nombre del archivo
      this.archivoPdf = archivo;
      this.nombreArchivoPdf = archivo.name;

      // Crear una URL segura para la vista previa del PDF
      const archivoUrl = URL.createObjectURL(archivo);

      // Asignar la URL segura a la variable vistaPreviaPdfUrl
      this.vistaPreviaPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(archivoUrl);
    } else { // Si no se selecciona un archivo o el archivo no es un PDF
      // Limpiar las variables relacionadas con el PDF
      this.nombreArchivoPdf = null;
      this.vistaPreviaPdfUrl = null;

      // Mostrar un mensaje de alerta al usuario
      alert('Por favor selecciona un archivo PDF válido.');
    }
  }


  // Función para cancelar la operación
  cancelar(): void {
    // Mostrar un mensaje de confirmación al usuario
    console.log('Operación cancelada');

    // Emitir el evento de cancelación y limpiar el formulario
    this.limpiarFormulario();
    this.cancelado.emit();
  }

  // Función para guardar el billete
  guardarBillete(): void {
    // Validar que todos los campos del formulario estén completos y que se haya seleccionado un PDF
    if (!this.tituloBillete || !this.categoriaBillete || !this.archivoPdf) {
      // Mostrar un mensaje de alerta si falta información
      alert('Por favor, completa todos los campos y añade un PDF.');
      return;
    }

    // Crear un objeto FormData para enviar los datos del billete y el PDF
    const formData = new FormData();

    // Asignar los valores del formulario al objeto billete
    this.billete.nombre = this.tituloBillete;
    this.billete.categoria = this.categoriaBillete;
    this.billete.pdf = this.archivoPdf.name;
    this.billete.viajeId = Number(this.viajeId);

    // Agregar los datos del billete y el archivo PDF al objeto FormData
    formData.append('billete', new Blob([JSON.stringify(this.billete)], { type: 'application/json' }));
    formData.append('pdf', this.archivoPdf);

    // Imprimir los datos del billete en la consola para depuración
    console.log('Datos del billete:', this.billete);

    // Llamar al servicio para crear el billete y manejar la respuesta
    this.billeteService.crearBillete(formData).subscribe({
      // Manejar la respuesta exitosa
      next: (response) => {
        // Imprimir la respuesta en la consola
        console.log('Billete guardado exitosamente:', response);

        // Emitir el evento de billete guardado con la respuesta del servidor
        this.billeteGuardado.emit(response);
        this.limpiarFormulario();
      },
      // Manejar errores durante el proceso de guardado
      error: (err) => {
        // Imprimir el error en la consola
        console.error('Error al guardar el billete:', err);

        // Mostrar un mensaje de alerta al usuario
        alert('Error al guardar el billete. Por favor, inténtalo de nuevo.');
      },
      // Función que se ejecuta al completar el proceso de guardado
      complete: () => {
        // Imprimir un mensaje de confirmación en la consola
        console.log('Proceso de guardado completado.');

        // Limpiar el formulario y emitir el evento de cancelación
        this.limpiarFormulario();
        this.cancelado.emit();
      }
    });
  }

  // Función para limpiar el formulario
  private limpiarFormulario(): void {
    // Limpiar las variables del formulario
    this.tituloBillete = '';
    this.categoriaBillete = '';
    this.archivoPdf = null;
    this.nombreArchivoPdf = '';
    this.vistaPreviaPdfUrl = null;
  }
}
