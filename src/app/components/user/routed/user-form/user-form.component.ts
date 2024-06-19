import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IUser } from 'src/app/model/model';
import { SessionService } from 'src/app/service/session.service';
import { UserService } from 'src/app/service/user.service';
import { config, GeolocationType, LngLat, Map, MapStyle, Marker } from '@maptiler/sdk';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent implements OnInit {

  @ViewChild('map')
  private mapContainer!: ElementRef;
  map: Map | undefined;
  marker: Marker | undefined;

  currentUser: IUser = {} as IUser;
  coords: { lat: number, lng: number } = { lat: 0, lng: 0 };
  mapboxApiKey: string = 'pk.eyJ1IjoiamF1bWVyb3NlbGxvLTMzIiwiYSI6ImNsd2lma2ZrNDBrMmsyaXVrNjg5MHdwaXMifQ.XAI3t3FSV6-z-RE8NbJ-cw';

  hasError: boolean = false;
  errorMessage: string = '';

  backgroundImage: string = '';
  birthdate: string = '';
  place: any = {};

  constructor(
    private sessionService: SessionService,
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit() {
    const images = [
      'image1.webp',
      'image2.webp',
      'image3.webp',
      'image4.webp'
    ];

    const randomImage = images[Math.floor(Math.random() * images.length)];

    this.backgroundImage = `url(assets/images/${randomImage})`;

    this.getCurrentUser();
    config.apiKey = 'Apyyhkp723bQ0aHy4fgs';
  }

  getCurrentUser(): void {
    if (this.sessionService.isSessionActive()) {
      const username = this.sessionService.getUsername();
      this.userService.getByUsername(username).subscribe({
        next: (user: IUser) => {
          this.currentUser = user;

          const initialState = {
            lat: 40.7128, // Latitud inicial
            lng: -74.006, // Longitud inicial
            zoom: 14 // Zoom inicial
          };

          // Inicializa el mapa con la configuración inicial
          this.map = new Map({
            container: this.mapContainer.nativeElement,
            zoom: initialState.zoom,
            style: MapStyle.STREETS, // Estilo del mapa (puedes cambiar a otro estilo de MapTiler)
            fullscreenControl: true,
            geolocateControl: true,
            geolocate: GeolocationType.POINT,
          });

          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
              const userLngLat = new LngLat(position.coords.longitude, position.coords.latitude);
      
              if (this.map) {
                this.marker?.setLngLat(userLngLat).addTo(this.map);
              }
              
              this.updateCoordinates(position.coords.latitude, position.coords.longitude);
              this.reverseGeocode(position.coords.longitude, position.coords.latitude);
            }, (error) => {
              console.error('Error al obtener la geolocalización:', error);
            });
          } else {
            console.error('Geolocalización no soportada por el navegador.');
          }
      
          this.marker?.setLngLat([this.map.getCenter().lng, this.map.getCenter().lat]).addTo(this.map);

          // Crea un marcador (opcional)
          this.marker = new Marker({
            color: 'red',
            draggable: true // Permite arrastrar el marcador
          });


          // Manejo de eventos para actualizar las coordenadas
          this.map.on('click', (event) => {
            const { lngLat } = event;
            this.marker?.setLngLat(lngLat).addTo(this.map!);
            this.updateCoordinates(lngLat.lat, lngLat.lng);
            this.reverseGeocode(lngLat.lng, lngLat.lat);
          });

          this.marker?.on('dragend', () => {
            const lngLat = this.marker?.getLngLat();
            this.updateCoordinates(lngLat!.lat, lngLat!.lng);
            this.reverseGeocode(lngLat!.lng, lngLat!.lat);
          });
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error al cargar los datos del usuario actual:', error);
        }
        
      });
    } else {
      this.router.navigate(['/login']); // Redirige al login si no hay sesión activa
    }
  }

  reverseGeocode(lng: number, lat: number) {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${this.mapboxApiKey}`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        this.place = data.features;
        if (data.features && data.features.length > 0) {

          this.currentUser.city = data.features[2].place_name.split(',')[0].trim();
          this.currentUser.country = data.features[data.features.length - 1].place_name.trim();

          if (isNaN(parseInt(this.currentUser.city))) {
            this.currentUser.city = data.features[2].place_name.split(',')[0].trim();
          } else {
            this.currentUser.city = data.features[2].place_name.split(',')[1].trim();
          }
        } else {
          this.hasError = true;
          this.errorMessage = 'The location is invalid';

          setTimeout(() => {
            this.hasError = false;
          }, 3000);
        }
      })
      .catch(error => console.log('Error:', error));
  }

  updateCoordinates(lat: number, lng: number): void {
    this.coords.lat = lat;
    this.coords.lng = lng;

    this.currentUser.location = `${lng.toString()} ${lat.toString()}`;
  }

  onlyNumberKey(event: any) {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
    }
  }

  activateUser(): void {
    this.currentUser.birthdate = new Date(this.birthdate);

    console.log(this.currentUser);

    if (this.currentUser.name === '' || this.currentUser.lastname === '' || this.currentUser.phone === '' || this.birthdate === '') {
      this.hasError = true;
      this.errorMessage = 'All fields are required';

      setTimeout(() => {
        this.hasError = false;
      }, 3000);
    } else if (this.currentUser.name.length < 3) {
      this.hasError = true;
      this.errorMessage = 'The name must have at least 3 characters';

      setTimeout(() => {
        this.hasError = false;
      }, 3000);
    } else if (this.currentUser.name.length > 20) {
      this.hasError = true;
      this.errorMessage = 'The name must have less than 20 characters';

      setTimeout(() => {
        this.hasError = false;
      }, 3000);
    } else if (this.currentUser.lastname.length < 3) {
      this.hasError = true;
      this.errorMessage = 'The lastname must have at least 3 characters';

      setTimeout(() => {
        this.hasError = false;
      }, 3000);
    } else if (this.currentUser.lastname.length > 20) {
      this.hasError = true;
      this.errorMessage = 'The lastname must have less than 20 characters';

      setTimeout(() => {
        this.hasError = false;
      }, 3000);
    } else if (this.currentUser.phone.length !== 9) {
      this.hasError = true;
      this.errorMessage = 'The phone must have 9 characters';

      setTimeout(() => {
        this.hasError = false;
      }, 3000);
    } else if (this.place.length === 0) {
      this.hasError = true;
      this.errorMessage = 'The location is invalid';

      setTimeout(() => {
        this.hasError = false;
      }, 3000);
    }

    if (this.currentUser.name.length < 3 || this.currentUser.name.length > 20 || this.currentUser.lastname.length < 3 || this.currentUser.lastname.length > 20 || this.currentUser.phone.length !== 9 || this.place.length === 0) {
      return;
    } else {
      this.currentUser.actived = true;

      this.userService.update(this.currentUser).subscribe({
        next: () => {
          this.router.navigate(['/user', this.currentUser.id]);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error al activar el usuario:', error);
        }
      });
    }
  }

  selectGender(isMale: boolean): void {
    this.currentUser.gender = isMale;
  }
}
