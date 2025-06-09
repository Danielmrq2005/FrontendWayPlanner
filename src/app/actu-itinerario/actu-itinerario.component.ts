import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {AlertController, IonicModule, IonModal, ModalController} from '@ionic/angular';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormControl,
  FormArray
} from '@angular/forms';
import { Router } from '@angular/router';
import { Itinerario } from '../Modelos/Itinerario';
import { ItineariosService } from '../Servicios/itinearios.service';
import { NgForOf, NgIf } from '@angular/common';
import { HorarioService } from '../Servicios/horario.service';
import { Horario } from '../Modelos/Horario';

@Component({
  selector: 'app-actu-itinerario',
  templateUrl: './actu-itinerario.component.html',
  styleUrls: ['./actu-itinerario.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, ReactiveFormsModule, NgIf, NgForOf],
})
export class ActuItinerarioComponent implements OnInit, AfterViewInit {
  fotoFile: File | null = null;
  horarioNuevo: Horario[] = [];
  @ViewChild(IonModal) modal!: IonModal;

  itinerario: Itinerario = {
    actividad: '',
    latitud: '',
    longitud: '',
    estaEnRuta: false,
    apareceEnItinerario: false,
    hora: '',
    medioTransporte: '',
    duracion: '',
    foto: '',
    categoria: '',
    idbillete: undefined,
    iddia: undefined,
    horarios: []
  };


  formularioItinerario!: FormGroup;
  formularioHorarioManual!: FormGroup;
  formularioHorarioEditado!: FormGroup;
  idViaje: number = 0;

  modalAbierto = false;
  indiceHorarioEditado = -1;

  diasSemana = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];
  mediosTransporte = [
    'ANDANDO',
    'BICICLETA',
    'COCHE',
    'AUTOBUS',
    'TREN',
    'METRO',
    'TAXI',
    'BARCO',
    'TRANVIA',
    'OTRO'
  ];
  categorias = [
    'MUSEO',
    'IGLESIA',
    'PARQUE',
    'MONUMENTO',
    'EVENTO',
    'OTROS'
  ];

  map: any;
  marker: any;

  // Para agregar horario manual
  // Ya no son variables independientes, usaremos el formularioHorarioManual

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private itinerarioService: ItineariosService,
    private modalCtrl: ModalController,
    private horarioService: HorarioService,
    private alertController: AlertController
  ) {
    const nav = this.router.getCurrentNavigation();
    this.itinerario = nav?.extras.state?.['itinerario'] || this.itinerario;
    this.idViaje = nav?.extras.state?.['idViaje'];
  }

  ngOnInit() {
    this.formularioItinerario = this.fb.group({
      actividad: [this.itinerario.actividad, Validators.required],
      categoria: [this.itinerario.categoria],
      hora: [this.itinerario.hora],
      duracion: [this.itinerario.duracion],
      latitud: [this.itinerario.latitud],
      longitud: [this.itinerario.longitud],
      estaEnRuta: [this.itinerario.estaEnRuta],
      apareceEnItinerario: [this.itinerario.apareceEnItinerario],
      idbillete: [this.itinerario.idbillete],
      iddia: [this.itinerario.iddia],
      foto: [this.itinerario.foto],
      medioTransporte: [this.itinerario.medioTransporte, Validators.required],
      horarios: this.fb.array(this.itinerario.horarios.map(horario => this.crearHorarioFormGroup(horario)))
    });

    this.formularioHorarioManual = this.fb.group({
      diaHorario: ['', Validators.required],
      horaInicio: ['', Validators.required],
      horaFin: ['', Validators.required],
      cerrado: [false]
    });

    this.inicializarMapa();
  }

  ngAfterViewInit() {
    this.inicializarMapa();
  }

  // Crear FormGroup para cada horario (para usar en el FormArray)
  crearHorarioFormGroup(horario: Horario): FormGroup {
    return this.fb.group({
      dia: [horario.dia, Validators.required],
      horaInicio: [horario.horaInicio, Validators.required],
      horaFin: [horario.horaFin, Validators.required],
      isClosed: [horario.isClosed]
    });
  }

  get horariosFormArray(): FormArray {
    return this.formularioItinerario.get('horarios') as FormArray;
  }

  abrirModalEditarHorario(index: number) {
    console.info('Abriendo modal para editar horario en el índice:', index);
    this.indiceHorarioEditado = index;
    const horario = this.itinerario.horarios[index];

    this.formularioHorarioEditado = this.fb.group({
      dia: [horario.dia, Validators.required],
      horaInicio: [horario.horaInicio, Validators.required],
      horaFin: [horario.horaFin, Validators.required],
      isClosed: [horario.isClosed]
    });

    this.modalAbierto = true;
  }

  cerrarModalEditarHorario() {
    this.modalAbierto = false;
    this.indiceHorarioEditado = -1;
  }

  guardarHorarioEditado() {
    if (this.formularioHorarioEditado.invalid) {
      this.formularioHorarioEditado.markAllAsTouched();
      this.presentAlert('Por favor, complete todos los campos del horario.');
      return;
    }

    const datos = this.formularioHorarioEditado.value;
    if (this.indiceHorarioEditado >= 0) {
      // Actualizar datos en el array de horarios
      this.itinerario.horarios[this.indiceHorarioEditado] = {
        ...this.itinerario.horarios[this.indiceHorarioEditado],
        dia: datos.dia,
        horaInicio: datos.horaInicio,
        horaFin: datos.horaFin,
        isClosed: datos.isClosed
      };

      this.horariosFormArray.at(this.indiceHorarioEditado).patchValue(datos);

      this.actualizarHorario(this.itinerario.horarios);
      this.cerrarModalEditarHorario();
    }
  }

  agregarHorarioManual() {
    if (this.formularioHorarioManual.invalid) {
      this.formularioHorarioManual.markAllAsTouched();
      this.presentAlert('Por favor, completa todos los campos del horario.');
      return;
    }

    const nuevoHorario: Horario = {
      id: 0,
      idItinerario: this.itinerario.id,
      dia: this.formularioHorarioManual.value.diaHorario,
      horaInicio: this.formularioHorarioManual.value.horaInicio,
      horaFin: this.formularioHorarioManual.value.horaFin,
      isClosed: this.formularioHorarioManual.value.cerrado
    };

    // Añadir a lista y FormArray
    this.itinerario.horarios.push(nuevoHorario);
    this.horariosFormArray.push(this.crearHorarioFormGroup(nuevoHorario));

    this.actualizarHorario(this.itinerario.horarios);

    // Resetear formulario manual
    this.formularioHorarioManual.reset({ cerrado: false });
  }

  cancel() {
    this.modal.dismiss();
  }

  onWillDismiss(event: any) {
    this.indiceHorarioEditado = -1;
  }

  eliminarHorario(index: number) {
    const idHorario = this.itinerario.horarios[index]
    this.itinerario.horarios.splice(index, 1);
    this.horariosFormArray.removeAt(index);

    this.horarioService.eliminarHorario(+idHorario)
      .subscribe({
        next: (respuesta) => {
          console.log('Horario eliminado:', respuesta);
        },
        error: (err) => {
          this.presentAlert("Error al eliminar el horario: " + err.error.message);
        },
        complete: () => {
          this.presentAlert("Horario eliminado correctamente.");
        }
      });
  }

  actualizarHorario(horarios: Horario[]) {

    this.horarioNuevo = horarios;
    this.itinerario.horarios = this.horarioNuevo;

    this.horarioService.actualizarHorario(horarios).subscribe({
      next: (respuesta) => {
        console.log('Horario actualizado:', respuesta);
      },
      error: (err) => {
        this.presentAlert("Error al actualizar el horario: " + err.error.message);
      },
      complete: () => {
        this.presentAlert("Horario actualizado correctamente.");
      }
    });
  }

  actualizarItinerario() {
    this.horariosFormArray.clear();
    this.itinerario.horarios.forEach(horario => {
      this.horariosFormArray.push(this.crearHorarioFormGroup(horario));
    });

    if (this.formularioItinerario.valid) {
      const formData = new FormData();
      // Copiar valores incluyendo horarios actualizados
      const valoresFormulario = { ...this.formularioItinerario.value, id: this.itinerario.id };
      const itinerarioBlob = new Blob([JSON.stringify(valoresFormulario)], { type: 'application/json' });
      formData.append('itinerario', itinerarioBlob);

      if (this.fotoFile) {
        formData.append('foto', this.fotoFile);
      } else {
        formData.append('foto', this.formularioItinerario.value.foto || '');
      }

      if (this.itinerario.id !== undefined) {
        formData.append('id', this.itinerario.id.toString());
      }

      this.itinerarioService.actualizarItinerario(formData).subscribe({
        next: (respuesta) => {
          console.log('Itinerario actualizado:', respuesta);
        },
        complete: () => {
          this.router.navigate(['/itinerarios/' + this.idViaje]);
        }
      });
    } else {
      this.formularioItinerario.markAllAsTouched();
      this.presentAlert('Por favor, rellena correctamente todos los campos obligatorios.');
    }
  }

  inicializarMapa() {
    const input = document.getElementById('autocomplete') as HTMLInputElement;
    const mapElement = document.getElementById('map');

    if (mapElement) {
      this.map = new google.maps.Map(mapElement, {
        center: { lat: 40.4168, lng: -3.7038 },
        zoom: 13,
      });
    }

    const autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', this.map);

    this.marker = new google.maps.Marker({
      map: this.map,
      draggable: true,
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place.geometry || !place.geometry.location) return;

      this.map.setCenter(place.geometry.location);
      this.marker.setPosition(place.geometry.location);

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();

      this.itinerario.latitud = lat.toString();
      this.itinerario.longitud = lng.toString();

      // Actualizar también el formulario para mantenerlo sincronizado
      this.formularioItinerario.patchValue({
        latitud: this.itinerario.latitud,
        longitud: this.itinerario.longitud
      });
    });

    this.map.addListener('click', (e: any) => {
      const clickedLatLng = e.latLng;
      this.marker.setPosition(clickedLatLng);

      this.itinerario.latitud = clickedLatLng.lat().toString();
      this.itinerario.longitud = clickedLatLng.lng().toString();

      this.formularioItinerario.patchValue({
        latitud: this.itinerario.latitud,
        longitud: this.itinerario.longitud
      });
    });
  }

  recargarMapa() {
    setTimeout(() => {
      this.inicializarMapa();
    }, 100);
  }

  cerrar() {
    this.modalCtrl.dismiss();
  }

  onFotoChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.fotoFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        this.formularioItinerario.patchValue({ foto: base64 });
      };
      reader.readAsDataURL(file);
    }
  }

  async presentAlert(mensaje: string) {
    const alert = await this.alertController.create({
      header: 'Atención',
      message: mensaje,
      buttons: ['OK'],
    });
    await alert.present();
  }
}
