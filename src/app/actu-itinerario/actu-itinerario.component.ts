import {AfterViewInit, Component, OnInit} from '@angular/core';
import {IonicModule, ModalController} from "@ionic/angular";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {Itinerario} from "../Modelos/Itinerario";
import {ItineariosService} from "../Servicios/itinearios.service";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-actu-itinerario',
  templateUrl: './actu-itinerario.component.html',
  styleUrls: ['./actu-itinerario.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, ReactiveFormsModule, NgIf],
})
export class ActuItinerarioComponent  implements OnInit, AfterViewInit {

  fotoFile: File | null = null;

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

  constructor(private router: Router, private fb: FormBuilder, private itinerarioService: ItineariosService, private modalCtrl: ModalController) {
    const nav = this.router.getCurrentNavigation();
    this.itinerario = nav?.extras.state?.['itinerario'];
  }

  formularioItinerario!: FormGroup;
  map: any;
  marker: any;

  ngAfterViewInit() {
    this.inicializarMapa();
  }

  ngOnInit() {
    this.inicializarMapa();    this.formularioItinerario = this.fb.group({
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
      foto: [this.itinerario.foto], // si quieres manipular la imagen también
    });
  }

  actualizarItinerario() {
    if (this.formularioItinerario.valid) {
      const formData = new FormData();

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
          this.router.navigate(['/itinerarios/' + this.itinerario.id]);
        }
      });
    }
  }



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

  recargarMapa() {
    setTimeout(() => {
      this.inicializarMapa();
    }, 100); // Delay opcional para asegurar que el DOM esté listo
  }

  cerrar() {
    this.modalCtrl.dismiss();
  }

  onFotoChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.fotoFile = file;  // ⬅️ Guardas el archivo aquí

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        this.formularioItinerario.patchValue({ foto: base64 });  // para previsualización
      };
      reader.readAsDataURL(file);
    }
  }

}
