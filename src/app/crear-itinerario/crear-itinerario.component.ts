/// <reference types="google.maps" />

// Importaciones de Angular, servicios y modelos necesarios
import { Component, OnInit } from '@angular/core';
import {AlertController, IonicModule} from "@ionic/angular";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NgForOf, NgIf} from "@angular/common";
import {jwtDecode} from "jwt-decode";
import {ViajeService} from "../Servicios/viaje.service";
import {Viaje} from "../Modelos/Viaje";
import {DiaService} from "../Servicios/dia.service";
import {Dia} from "../Modelos/Dia";
import {BilleteService} from "../Servicios/billete.service";
import {Billete} from "../Modelos/Billete";
import {Itinerario} from "../Modelos/Itinerario";
import { AfterViewInit } from '@angular/core';
import {ItineariosService} from "../Servicios/itinearios.service";
import {TemaService} from "../Servicios/tema.service";
import {Horario} from "../Modelos/Horario";
import {HorarioService} from "../Servicios/horario.service";
import {Router} from "@angular/router";

// Decorador del componente Angular
@Component({
    selector: 'app-crear-itinerario',
    templateUrl: './crear-itinerario.component.html',
    styleUrls: ['./crear-itinerario.component.scss'],
    standalone: true,
    imports: [
      IonicModule,
      ReactiveFormsModule,
      FormsModule,
      NgForOf,
      NgIf,
    ]
})
export class CrearItinerarioComponent  implements OnInit, AfterViewInit {
  darkMode = false; // Controla el modo oscuro

  // Inyección de dependencias y suscripción al modo oscuro
  constructor(private viajeService: ViajeService,
              private diaService : DiaService,
              private billeteService: BilleteService,
              private itinerarioService: ItineariosService,
              private horarioService: HorarioService,
              private router: Router, private temaService: TemaService,
              private   alertController: AlertController) {
    this.temaService.darkMode$.subscribe(isDark => {
      this.darkMode = isDark;
    });
  }

  // Inicialización de datos al cargar el componente
  ngOnInit() {
      this.obtenerViajesPorUsuario();
      this.obtenerDiasPorViaje();
      this.idViaje = history.state.idViaje;

    // Inicializa el valor de apareceEnItinerario si corresponde
    if (!this.itinerario.apareceEnItinerario && !this.itinerario.estaEnRuta) {
      this.itinerario.apareceEnItinerario = true;
    }
  }

  // Inicializa el mapa de Google Maps después de que la vista se ha cargado
  ngAfterViewInit(): void {
    this.inicializarMapa();
  }

  map: any; // Referencia al mapa
  marker: any; // Referencia al marcador
  fotoPreview: string | null = null; // Vista previa de la foto seleccionada

  // Inicializa el mapa y el autocompletado de lugares
  inicializarMapa() {
    const input = document.getElementById('autocomplete') as HTMLInputElement;
    const mapElement = document.getElementById('map');

    if (mapElement) {
      this.map = new google.maps.Map(mapElement, {
        center: {lat: 40.4168, lng: -3.7038},
        zoom: 13,
      });
    }

    const autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', this.map);

    this.marker = new google.maps.Marker({
      map: this.map,
      draggable: true,
    });

    // Evento cuando se selecciona un lugar en el autocompletado
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place.geometry || !place.geometry.location) return;

      this.map.setCenter(place.geometry.location);
      this.marker.setPosition(place.geometry.location);

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();

      this.itinerario.latitud = lat.toString();
      this.itinerario.longitud = lng.toString();
    });

    // Evento al hacer clic en el mapa
    this.map.addListener('click', (e: any) => {
      const clickedLatLng = e.latLng;
      this.marker.setPosition(clickedLatLng);

      this.itinerario.latitud = clickedLatLng.lat().toString();
      this.itinerario.longitud = clickedLatLng.lng().toString();
    });
  }

  // Variables de control de formularios
  mostrarFormularioBillete = false;
  mostrarFormularioDia = false;

  // Variables de datos
  idusuario: number = 0;
  viajes: Viaje[] = [];
  idViajeSeleccionado: number = 0;
  dias: Dia[] = [];
  fotoSeleccionada: File | null = null;
  billeteSeleccionado: File | null = null;
  horariosCrear: Horario[] = [];

  // Modelo de itinerario inicializado
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
    idbillete: 0,
    iddia: 0,
    horarios: []
  }

  // Listas de categorías
  categorias: string[] = [
    'AVION',
    'TREN',
    'AUTOBUS',
    'BARCO',
    'CONCIERTO',
    'MUSEO',
    'EVENTO'
  ];

  categoriaItinerario: string[] = [
    'MUSEO',
    'IGLESIA',
    'PARQUE',
    'MONUMENTO',
    'EVENTO',
    'OTROS'
  ];

  // Modelo de billete inicializado
  billete: Billete = {
    nombre: '',
    categoria: '',
    pdf: '',
    viajeId: 0
  };

  // Modelo de día inicializado
  dia = {
    fecha: '',
    numeroDia: 0,
    diaSemana: '',
    idViaje: 0
  }

  // Variables para horarios
  diaHorario: string = '';
  horaInicio: string = '';
  horaFin: string = '';
  cerrado: boolean = false;
  horarios: string = '';
  itinerarioCreadoId?: number;
  diaSeleccionado? : number;
  idBilleteSeleccionado?: number;
  idViaje? : number;

  // Agrega un horario a la lista de horariosCrear
  agregarHorario() {
    if (this.horaInicio && this.horaFin && this.diaHorario) {
      const nuevoHorario: Horario = {
        id: 0,
        idItinerario: 0,
        dia: this.diaHorario,
        horaInicio: this.horaInicio,
        horaFin: this.horaFin,
        isClosed: this.cerrado
      };

      this.horariosCrear.push(nuevoHorario);

      const descripcion = `${this.diaHorario} - ${this.horaInicio} - ${this.horaFin} - ${this.cerrado ? 'CERRADO' : 'ABIERTO'}`;
      this.horarios = this.horarios
        ? this.horarios + '\n' + descripcion
        : descripcion;

      // Limpia los valores de los campos
      this.horaInicio = '';
      this.horaFin = '';
      this.diaHorario = '';
      this.cerrado = false;

      // Limpia los inputs en el DOM
      const horaInicioInput = document.getElementById('horaInicio') as HTMLInputElement;
      const horaFinInput = document.getElementById('horaFin') as HTMLInputElement;
      if (horaInicioInput) horaInicioInput.value = '';
      if (horaFinInput) horaFinInput.value = '';
    } else {
      console.warn('Por favor, completa todos los campos del horario.');
    }
  }

  // Muestra/oculta el formulario de billete
  toggleBilleteForm() {
    this.mostrarFormularioBillete = !this.mostrarFormularioBillete;
  }

  // Muestra/oculta el formulario de día
  toggleDiaForm() {
    this.mostrarFormularioDia = !this.mostrarFormularioDia;
  }

  // Obtiene el ID del usuario desde el token JWT
  obtenerUsuarioId(): number {
    const token = sessionStorage.getItem('authToken');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        console.log(decodedToken);
        return decodedToken.tokenDataDTO?.id || 0;
      } catch (error) {
        console.error('Error al decodificar el token', error);
      }
    }
    return 0;
  }

  // Crea un billete usando el servicio correspondiente
  async crearBillete() {
    if (!this.mostrarFormularioBillete) return;

    if (!this.billete.nombre.trim()) {
      await this.presentAlert('Debes ingresar el nombre del billete.');
      return;
    }

    if (!this.billete.categoria.trim()) {
      await this.presentAlert('Debes seleccionar una categoría para el billete.');
      return;
    }

    if (!this.billeteSeleccionado) {
      await this.presentAlert('Debes seleccionar un archivo PDF para el billete.');
      return;
    }

    if (!this.idViajeSeleccionado) {
      await this.presentAlert('Debes seleccionar un viaje antes de crear el billete.');
      return;
    }

    const formData = new FormData();
    this.billete.nombre = this.billete.nombre.trim();
    this.billete.categoria = this.billete.categoria.trim();
    this.billete.viajeId = this.idViajeSeleccionado;
    this.billete.pdf = '';

    formData.append(
      'billete',
      new Blob([JSON.stringify(this.billete)], { type: 'application/json' })
    );

    formData.append('pdf', this.billeteSeleccionado);

    this.billeteService.crearBillete(formData).subscribe({
      next: (response: any) => {
        console.log('Billete creado exitosamente:', response);
      },
      error: (err) => {
        console.error('Error al crear el billete:', err);
      },
      complete: () => {
        console.log('Proceso de creación de billete completado');
        this.billete = { nombre: '', categoria: '', pdf: '', viajeId : 0 };
        this.toggleBilleteForm();
      }
    });
  }

  // Crea un día usando el servicio correspondiente
  async crearDia() {
    if (!this.mostrarFormularioDia) return;

    if (!this.dia.fecha.trim()) {
      await this.presentAlert('Debes ingresar una fecha para el día.');
      return;
    }

    if (!this.dia.numeroDia || this.dia.numeroDia <= 0) {
      await this.presentAlert('Debes ingresar un número de día válido (mayor a 0).');
      return;
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaIngresada = new Date(this.dia.fecha);
    if (fechaIngresada < hoy) {
      await this.presentAlert('La fecha no puede ser anterior a hoy.');
      return;
    }

    if (!this.dia.diaSemana.trim()) {
      await this.presentAlert('Debes ingresar el día de la semana.');
      return;
    }

    if (!this.idViajeSeleccionado) {
      await this.presentAlert('Debes seleccionar un viaje antes de crear el día.');
      return;
    }

    // Crear objeto Dia y enviar
    const diaData: Dia = {
      fecha: this.dia.fecha,
      numeroDia: this.dia.numeroDia,
      diaSemana: this.dia.diaSemana,
      idViaje: this.idViajeSeleccionado
    };

    this.diaService.crearDia(diaData).subscribe({
      next: (response) => {
        console.log('Día creado exitosamente:', response);
      },
      error: (err) => {
        console.error('Error al crear el día:', err);
      },
      complete: () => {
        console.log('Proceso de creación de día completado');
        this.dia = { fecha: '', numeroDia: 0, diaSemana: '', idViaje: 0 };
        this.mostrarFormularioDia = false;
        this.obtenerDiasPorViaje();
      }
    });
  }

  // Maneja la selección de una foto y genera una vista previa
  onFotoSeleccionada(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.fotoSeleccionada = file;
        this.fotoPreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // Crea un itinerario usando el servicio correspondiente
  async crearItinerario() {
    if (!this.idViajeSeleccionado) {
      await this.presentAlert('Debes seleccionar un viaje.');
      return;
    }

    if (!this.diaSeleccionado) {
      await this.presentAlert('Debes seleccionar un día.');
      return;
    }

    const camposObligatorios = [
      this.itinerario.actividad,
      this.itinerario.latitud,
      this.itinerario.longitud,
      this.itinerario.hora,
      this.itinerario.categoria,
    ];

    if(this.itinerario.medioTransporte === ''){
      this.itinerario.medioTransporte = null;
    }

    if(this.itinerario.duracion === ''){
      this.itinerario.duracion = null;
    }

    if (camposObligatorios.some(c => !c || c.trim() === '')) {
      await this.presentAlert('Por favor, completa todos los campos obligatorios del itinerario.');
      return;
    }

    // Si no hay foto seleccionada, usa una por defecto
    if (!this.fotoSeleccionada) {
      const response = await fetch('assets/default.jpg');
      const blob = await response.blob();
      this.fotoSeleccionada = new File([blob], 'default.jpg', { type: blob.type });
    }

    this.itinerario.horarios = this.horariosCrear;

    const formData = new FormData();
    const itinerarioJson = {
      ...this.itinerario,
      idbillete: this.idBilleteSeleccionado || null,
      iddia: this.diaSeleccionado || null,
      horarios: this.itinerario.horarios || []
    };

    formData.append(
      'itinerario',
      new Blob([JSON.stringify(itinerarioJson)], { type: 'application/json' })
    );

    formData.append('foto', this.fotoSeleccionada);

    this.itinerarioService.crearItinerarioConFoto(formData).subscribe({
      next: (response: any) => {
        console.log('Itinerario creado exitosamente:', response)
        this.itinerarioCreadoId = response.id ;
      },
      error: (err) => {
        console.error('Error al crear el itinerario:', err);
      },
      complete: () => {
        console.log('Proceso de creación de itinerario completado');
        this.crearHorario(this.itinerario.horarios);
        this.router.navigate(['/itinerarios/', this.idViajeSeleccionado]);
        this.resetearFormulario();
      }
    });
  }

  // Crea los horarios asociados al itinerario
  crearHorario(horariosss: Horario[]){
    if (this.itinerarioCreadoId) {
      horariosss.forEach(horario => {
        horario.idItinerario = this.itinerarioCreadoId;
      });
      this.horarioService.crearHorario(horariosss).subscribe({
        next: (respuesta) => {
          console.log('Horarios creados:', respuesta);
        },
        error: (err) => {
          console.error('Error al crear horarios:', err);
        },
        complete: () => {
          console.log('Proceso de creación de horarios completado');
        }
      });
    }
  }

  cancelar() {
    this.resetearFormulario();
    this.router.navigate(['/itinerarios/', this.idViaje]);
  }

  // Resetea el formulario de itinerario
  resetearFormulario() {
    this.itinerario = {
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
      idbillete: 0,
      iddia: 0,
      horarios: []
    };
    this.fotoSeleccionada = null;
  }

  // Obtiene los viajes del usuario autenticado
  obtenerViajesPorUsuario() {
    this.idusuario = this.obtenerUsuarioId();
    if (this.idusuario) {
      this.viajeService.listarViajesPorUsuario(this.idusuario).subscribe({
        next: (viajes) => {
          this.viajes = viajes;
          console.log('Viajes recibidos:', viajes);
        },
        error: (err) => {
          console.error('Error al obtener viajes:', err);
        },
        complete: () => {
          console.log('Consulta de viajes completada');
        }
      });
    }
  }

  // Obtiene los días asociados al viaje seleccionado
  obtenerDiasPorViaje() {
    if (this.idViajeSeleccionado) {
      this.diaService.obtenerDias(this.idViajeSeleccionado).subscribe({
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

  // Recarga el mapa (útil si el DOM cambia)
  recargarMapa() {
    setTimeout(() => {
      this.inicializarMapa();
    }, 100); // Delay opcional para asegurar que el DOM esté listo
  }

  // Maneja la selección de un PDF para el billete
  onPdfSeleccionado(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.billete.pdf = input.files[0].name;
    } else {
      this.billete.pdf = '';
    }
  }

  // Evento al cambiar el viaje seleccionado
  onViajeChange() {
    this.obtenerDiasPorViaje();
  }

  onToggleApareceEnItinerario(event: any) {
    if (!this.itinerario) return;
    const aparece = event.detail.checked;
    const ruta = this.itinerario.estaEnRuta;
    if (!aparece && !ruta) {
      setTimeout(() => {
        this.itinerario.apareceEnItinerario = true;
      }, 0);
      this.presentAlert('Al menos uno debe estar activado.');
    }
  }

  onToggleEstaEnRuta(event: any) {
    if (!this.itinerario) return;
    const ruta = event.detail.checked;
    const aparece = this.itinerario.apareceEnItinerario;
    if (!ruta && !aparece) {
      setTimeout(() => {
        this.itinerario.estaEnRuta = true;
      }, 0);
      this.presentAlert('Al menos uno debe estar activado.');
    }
  }

  // Muestra una alerta de validación
  async presentAlert(mensaje: string) {
    const alert = await this.alertController.create({
      header: 'Error de validación',
      message: mensaje,
      buttons: ['OK'],
    });
    await alert.present();
  }
}


