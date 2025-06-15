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
import {DiaService} from "../Servicios/dia.service";
import {Dia} from "../Modelos/Dia";

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
  fotoPreview: string | null = null;
  dias: Dia[] = [];

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
    private alertController: AlertController,
    private diaService: DiaService
  ) {
    const nav = this.router.getCurrentNavigation();
    this.itinerario = nav?.extras.state?.['itinerario'] || this.itinerario;
    this.idViaje = nav?.extras.state?.['idViaje'];
  }

  ngOnInit() {
    this.formularioItinerario = this.fb.group({
      actividad: [this.itinerario.actividad, Validators.required],
      categoria: [this.itinerario.categoria, Validators.required],
      hora: [this.itinerario.hora, Validators.required],
      duracion: [this.itinerario.duracion, ],
      latitud: [this.itinerario.latitud,Validators.required],
      longitud: [this.itinerario.longitud,Validators.required],
      estaEnRuta: [this.itinerario.estaEnRuta],
      apareceEnItinerario: [this.itinerario.apareceEnItinerario],
      idbillete: [this.itinerario.idbillete],
      iddia: [this.itinerario.iddia],
      foto: [this.itinerario.foto],
      medioTransporte: [this.itinerario.medioTransporte],
      horarios: this.fb.array(this.itinerario.horarios.map(horario => this.crearHorarioFormGroup(horario)))
    });



    this.formularioHorarioManual = this.fb.group({
      diaHorario: ['', Validators.required],
      horaInicio: ['', Validators.required],
      horaFin: ['', Validators.required],
      cerrado: [false]
    });

    this.obtenerDiasPorViaje();

    this.inicializarMapa();
  }

  ngAfterViewInit() {
    this.inicializarMapa();
  }


  crearHorarioFormGroup(horario: Horario): FormGroup {
    return this.fb.group({
      id: [horario.id],  // <- este campo es necesario
      idItinerario: [horario.idItinerario], // <- también necesario para asignar correctamente
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
    this.formularioHorarioManual.reset({
      diaHorario: '',
      cerrado: false
    });
  }

  cancel() {
    this.modal.dismiss();
  }

  onWillDismiss(event: any) {
    this.indiceHorarioEditado = -1;
  }

  // Cambia el valor de estaEnRuta según el toggle de apareceEnItinerario
  onToggleApareceEnItinerario(event: any) {
    const aparece = event.detail.checked;
    const ruta = this.formularioItinerario.get('estaEnRuta')?.value;
    if (!aparece && !ruta) {
      this.formularioItinerario.patchValue({ apareceEnItinerario: true });
      this.presentAlert('Al menos uno debe estar activado.');
    }
  }

  onToggleEstaEnRuta(event: any) {
    const ruta = event.detail.checked;
    const aparece = this.formularioItinerario.get('apareceEnItinerario')?.value;
    if (!ruta && !aparece) {
      this.formularioItinerario.patchValue({ estaEnRuta: true });
      this.presentAlert('Al menos uno debe estar activado.');
    }
  }

  // Métdo para eliminar un horario
  async eliminarHorario(index: number) {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Seguro que deseas eliminar este horario?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: () => {
            const idHorario = this.itinerario.horarios[index].id;
            this.itinerario.horarios.splice(index, 1);
            this.horariosFormArray.removeAt(index);

            this.horarioService.eliminarHorario(idHorario)
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
        }
      ]
    });
    await alert.present();
  }

  cancelar() {
    this.router.navigate(['/itinerarios/' + this.idViaje]);
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
    if (this.formularioItinerario.valid) {
      const formData = new FormData();

      // Asegura que el FormArray refleja el array real de horarios
      this.formularioItinerario.setControl('horarios', this.fb.array(
        this.itinerario.horarios.map(horario => this.crearHorarioFormGroup(horario))
      ));

      this.formularioItinerario.get('iddia')?.valueChanges.subscribe(value => {
        this.itinerario.iddia = value;
      });



      // Obtener todos los valores actualizados desde el formulario
      const valoresFormulario = { ...this.formularioItinerario.value, id: this.itinerario.id };

      if (valoresFormulario.medioTransporte === '') {
        valoresFormulario.medioTransporte = null;
      }

      if (valoresFormulario.duracion === '') {
        valoresFormulario.duracion = null;
      }

      // Asegurar que el campo horarios incluye los actuales del FormArray
      valoresFormulario.horarios = this.horariosFormArray.value;

      // Convertimos el objeto a un Blob para enviarlo como JSON
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
    // Obtenemos el mapa y el input de autocompletado
    const input = document.getElementById('autocomplete') as HTMLInputElement;
    const mapElement = document.getElementById('map');

    // Usa la ubicación del itinerario si está disponible, si no, usa la de Madrid
    const lat = this.itinerario.latitud ? parseFloat(this.itinerario.latitud) : 40.4168;
    const lng = this.itinerario.longitud ? parseFloat(this.itinerario.longitud) : -3.7038;

    if (mapElement) {
      this.map = new google.maps.Map(mapElement, {
        center: { lat, lng },
        zoom: 13,
      });
    }

    const autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', this.map);

    this.marker = new google.maps.Marker({
      map: this.map,
      draggable: true,
      position: { lat, lng }, // Coloca el marcador en la ubicación inicial
    });

    // Si el itinerario tiene latitud y longitud, centramos el mapa y colocamos el marcador
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place.geometry || !place.geometry.location) return;

      this.map.setCenter(place.geometry.location);
      this.marker.setPosition(place.geometry.location);

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();

      this.itinerario.latitud = lat.toString();
      this.itinerario.longitud = lng.toString();

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
        this.fotoPreview = reader.result as string; // Guardar la previsualización
      };
      reader.readAsDataURL(file);
    }
  }

  // Métdo para obtener los días del viaje
  obtenerDiasPorViaje() {
    if (this.idViaje) {
      this.diaService.obtenerDias(this.idViaje).subscribe({
        next: (dias) => {
          console.log('Días recibidos:', dias);
          this.dias = dias;
        },
        error: (err) => {
          console.error('Error al obtener días:', err);
        },
        complete: () => {
          console.log('Consulta de días completada');
        }
      });
    } else {
      console.warn('No se ha seleccionado un viaje válido');
    }
  }

  // Métdo para mostrar alertas
  async presentAlert(mensaje: string) {
    const alert = await this.alertController.create({
      header: 'Atención',
      message: mensaje,
      buttons: ['OK'],
    });
    await alert.present();
  }
}
