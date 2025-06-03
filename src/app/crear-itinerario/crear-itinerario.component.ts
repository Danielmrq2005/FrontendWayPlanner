/// <reference types="google.maps" />

import { Component, OnInit } from '@angular/core';
import {IonicModule} from "@ionic/angular";
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
import {Horario} from "../Modelos/Horario";
import {HorarioService} from "../Servicios/horario.service";
import {Router} from "@angular/router";


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

  constructor(private viajeService: ViajeService, private diaService : DiaService, private billeteService: BilleteService, private itinerarioService: ItineariosService, private horarioService: HorarioService, private router: Router) { }

  ngOnInit() {
      this.obtenerViajesPorUsuario();
      this.obtenerDiasPorViaje();
  }

  ngAfterViewInit(): void {
    this.inicializarMapa();
  }

  map: any;
  marker: any;


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

    this.map.addListener('click', (e: any) => {
      const clickedLatLng = e.latLng;
      this.marker.setPosition(clickedLatLng);

      this.itinerario.latitud = clickedLatLng.lat().toString();
      this.itinerario.longitud = clickedLatLng.lng().toString();
    });
  }

  mostrarFormularioBillete = false;
  mostrarFormularioDia = false;

  idusuario: number = 0;
  viajes: Viaje[] = [];
  idViajeSeleccionado: number = 0;
  dias: Dia[] = [];
  fotoSeleccionada: File | null = null;
  horariosCrear: Horario[] = [];

  itinerario: Itinerario = {
    actividad: '',
    latitud: '',
    longitud: '',
    estaEnRuta: false,
    apareceEnItinerario: false,
    hora: '',
    duracion: '',
    foto: '',
    categoria: '',
    idbillete: 0,
    iddia: 0,
    horarios: []
  }

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

  billete = {
    nombre: '',
    categoria: '',
    pdf: null as File | null
  };

  dia = {
    fecha: '',
    numeroDia: 0,
    idViaje: 0
  }

  diaHorario: string = '';
  horaInicio: string = '';
  horaFin: string = '';
  cerrado: boolean = false;
  horarios: string = '';
  itinerarioCreadoId?: number;
  diaSeleccionado? : number;
  idBilleteSeleccionado?: number;

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

      this.horaInicio = '';
      this.horaFin = '';
      this.diaHorario = '';
      this.cerrado = false;
    } else {
      console.warn('Por favor, completa todos los campos del horario.');
    }
  }


  toggleBilleteForm() {
    this.mostrarFormularioBillete = !this.mostrarFormularioBillete;
  }

  toggleDiaForm() {
    this.mostrarFormularioDia = !this.mostrarFormularioDia;
  }

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

  crearBillete() {

    console.log('Valores actuales del billete:', this.billete);
    console.log('ID de viaje seleccionado:', this.idViajeSeleccionado);
    if (
      this.billete.pdf &&
      this.billete.nombre.trim() !== '' &&
      this.billete.categoria.trim() !== '' &&
      this.idViajeSeleccionado
    ) {
      const formData = new FormData();
      formData.append('nombre', this.billete.nombre);
      formData.append('categoria', this.billete.categoria);
      formData.append('pdf', this.billete.pdf);
      formData.append('viajeId', this.idViajeSeleccionado.toString());

      this.billeteService.crearBillete(formData).subscribe({
        next: (response: any) => {
          console.log('Billete creado exitosamente:', response);
          this.idBilleteSeleccionado = response.id;
        },
        error: (err) => {
          console.error('Error al crear el billete:', err);
        },
        complete: () => {
          console.log('Proceso de creación de billete completado');
          this.billete = { nombre: '', categoria: '', pdf: null };
          this.toggleBilleteForm();
        }
      });
    } else {
      console.warn('Por favor, completa todos los campos del billete antes de enviar.');
    }
  }

  crearDia() {
    console.log('Valores actuales del día:', this.dia);
    if (
      this.dia.fecha.trim() !== '' &&
      this.dia.numeroDia > 0 &&
      this.idViajeSeleccionado
    ) {
      const diaData: Dia = {
        fecha: this.dia.fecha,
        numeroDia: this.dia.numeroDia,
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
          this.dia = { fecha: '', numeroDia: 0, idViaje: 0 };
          this.mostrarFormularioDia = false;
          this.obtenerDiasPorViaje();
        }
      });
    } else {
      console.warn('Por favor, completa todos los campos del día antes de enviar.');
    }
  }

  onFotoSeleccionada(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.fotoSeleccionada = file;
    }
  }


  crearItinerario() {
    console.log('Valores actuales del itinerario:', this.itinerario);
    console.log('ID de viaje seleccionado:', this.idViajeSeleccionado);

    if (
      this.itinerario.actividad.trim() !== '' &&
      this.itinerario.latitud.trim() !== '' &&
      this.itinerario.longitud.trim() !== '' &&
      this.itinerario.hora.trim() !== '' &&
      this.itinerario.duracion.trim() !== '' &&
      this.itinerario.categoria.trim() !== ''
    ) {
      if (!this.fotoSeleccionada) {
        console.warn('Debes seleccionar una foto');
        return;
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
          console.log('EL puto id es: '  + this.itinerarioCreadoId);
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
    } else {
      console.warn('Por favor, completa todos los campos del itinerario antes de enviar.');
    }
  }

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
    } else {
      console.warn('No se ha creado un itinerario válido para asociar horarios.');
    }
  }

  resetearFormulario() {
    this.itinerario = {
      actividad: '',
      latitud: '',
      longitud: '',
      estaEnRuta: false,
      apareceEnItinerario: false,
      hora: '',
      duracion: '',
      foto: '',
      categoria: '',
      idbillete: 0,
      iddia: 0,
      horarios: []
    };
    this.fotoSeleccionada = null;
  }




  obtenerViajesPorUsuario() {
    this.idusuario = this.obtenerUsuarioId();
    if (this.idusuario) {
      this.viajeService.listarViajesPorUsuario(this.idusuario).subscribe({
        next: (viajes) => {
          this.viajes = viajes;
          console.log('Viajes recibidos:', viajes);
          // Aquí puedes asignar los viajes a una propiedad si lo necesitas
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



  onPdfSeleccionado(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.billete.pdf = input.files[0];
      console.log('PDF seleccionado:', this.billete.pdf.name);
    }
  }

  onViajeChange() {
    this.obtenerDiasPorViaje();
  }

}

//TODO: Hacer que horarios lo interprete como un objeto horario y hacer que la foto se muestre
