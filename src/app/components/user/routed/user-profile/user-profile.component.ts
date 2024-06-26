import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from 'src/app/service/user.service';
import { ICar, IChat, IUser } from 'src/app/model/model';
import { SessionService } from 'src/app/service/session.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RatingService } from 'src/app/service/rating.service';
import { CarService } from 'src/app/service/car.service';
import { API_URL_MEDIA } from 'src/environment/environment';
import { SavedService } from 'src/app/service/saved.service';
import { MediaService } from 'src/app/service/media.service';
import { ToastService } from './../../../../service/toast.service';
import { config, GeolocationType, LngLat, Map, MapStyle, Marker } from '@maptiler/sdk';
import { last } from 'rxjs';
import { ChatService } from 'src/app/service/chat.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {

  @ViewChild('tabContainer', { static: true }) tabContainer!: ElementRef;

  @ViewChild('map')
  private mapContainer!: ElementRef;
  map: Map | undefined;
  marker: Marker | undefined;

  urlImage = API_URL_MEDIA;
  user: IUser = {} as IUser;
  currentUser: IUser = {} as IUser;
  id!: number;
  userRatingCount: number = 0;
  userAverageRating: number = 0;
  searchFilterPosts: string = '';
  searchFilterSaved: string = '';
  cars: ICar[] = [];
  savedCars: ICar[] = [];
  imageIndex: { [key: number]: number } = {};
  isViewModalVisible: boolean = false;
  selectedCar: ICar = {} as ICar; // Car seleccionado para mostrar en el modal
  isDeleteModalVisible: boolean = false;
  idToDelete: number | null = null;
  isInfoShown: boolean = false;
  isPostsShown: boolean = false;
  isSavedShown: boolean = false;
  ratingCount: { [key: number]: number } = {};
  ratingAverage: { [key: number]: number } = {};
  setContentEditable: boolean = false;
  isUsernameAvaible: boolean = false;
  coords: { lat: number, lng: number } = { lat: 0, lng: 0 };
  mapboxApiKey: string = 'pk.eyJ1IjoiamF1bWVyb3NlbGxvLTMzIiwiYSI6ImNsd2lma2ZrNDBrMmsyaXVrNjg5MHdwaXMifQ.XAI3t3FSV6-z-RE8NbJ-cw';
  description: string = '';
  isComingFromSaved: boolean = false;
  hasError: boolean = false;
  errorMessage: string = '';
  place: any = {};

  constructor(
    private userService: UserService,
    private sessionService: SessionService,
    private route: ActivatedRoute,
    private ratingService: RatingService,
    private carService: CarService,
    private router: Router, // inyectar Router
    private savedService: SavedService, // inyectar SavedService
    private mediaService: MediaService,
    private toastService: ToastService,
    private chatService: ChatService
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.id = +params['id'];
      if (this.id) {
        this.getUser().then(userExists => {
          if (!userExists) {
            this.router.navigate(['/']); // Redirige a la página de inicio si el usuario no existe
            return;
          }
          this.getCurrentUser();
          this.route.queryParams.subscribe(params => {
            if (params['showSaved']) {
              this.isComingFromSaved = true;
            }
          });
        });
        config.apiKey = 'Apyyhkp723bQ0aHy4fgs';
      } else {
        console.error('ID is undefined');
        this.router.navigate(['/']); // Redirige a la página de inicio si no hay ID
      }
    });

  }

  ngAfterViewInit() {
    this.map = new Map({
      container: this.mapContainer.nativeElement,
      // center: [initialState.lng, initialState.lat],
      // zoom: initialState.zoom,
      style: MapStyle.STREETS,
      geolocateControl: true,
      geolocate: GeolocationType.POINT,
      fullscreenControl: true,
    });

    this.marker = new Marker({
      color: 'red',
      draggable: true
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const userLngLat = new LngLat(position.coords.longitude, position.coords.latitude);

        if (this.map) {
          this.marker?.setLngLat(userLngLat).addTo(this.map);
        }

        this.reverseGeocode(position.coords.longitude, position.coords.latitude);
      }, (error) => {
        console.error('Error al obtener la geolocalización:', error);
      });
    } else {
      console.error('Geolocalización no soportada por el navegador.');
    }

    this.marker.setLngLat([this.map.getCenter().lng, this.map.getCenter().lat]).addTo(this.map);

    this.marker.on('dragend', () => {
      const lngLat = this.marker?.getLngLat();

      if (lngLat) {
        this.currentUser.location = lngLat.lng.toString() + ' ' + lngLat.lat.toString();

        this.reverseGeocode(lngLat.lng, lngLat.lat);
      }
    });

    this.map.on('click', (e) => {
      const lngLat = e.lngLat;
      this.marker?.setLngLat([lngLat.lng, lngLat.lat]);
      this.currentUser.location = lngLat.lng.toString() + ' ' + lngLat.lat.toString();
      this.reverseGeocode(lngLat.lng, lngLat.lat);
    });
  }

  ngOnDestroy() {
    this.map?.remove();
  }

  getUser(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.userService.get(this.id).subscribe({
        next: (user: IUser) => {
          this.user = user;
          this.getUserRatingCount(this.id);
          this.getUserRatingAverage(this.id);
          this.loadCars();
          this.getSavedCars();
          this.fillSavedCars();

          this.coords = {
            lng: parseFloat(this.user.location.split(' ')[0]),
            lat: parseFloat(this.user.location.split(' ')[1])
          };

          const initialState = {
            lat: this.coords.lat,
            lng: this.coords.lng,
            zoom: 14
          };

          this.map = new Map({
            container: this.mapContainer.nativeElement,
            center: [initialState.lng, initialState.lat],
            zoom: initialState.zoom,
            style: MapStyle.STREETS,
            fullscreenControl: true,
            geolocateControl: false
          });

          this.marker = new Marker({
            color: 'red',
            draggable: false
          });

          resolve(true); // El usuario existe
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error al cargar los datos del usuario:', error);
          resolve(false); // El usuario no existe
        }
      });
    });
  }

  getCurrentUser(): void {
    if (this.sessionService.isSessionActive()) {
      const username = this.sessionService.getUsername();
      this.userService.getByUsername(username).subscribe({
        next: (user: IUser) => {
          this.currentUser = user;
          this.description = this.user.description;
          if ((user.id === this.user.id) && !user.actived) {
            this.router.navigate(['/activate']);
          }
          if (user.id === this.user.id) {
            this.showInfo();
          } else {
            this.showPosts();
          }


          if (this.isComingFromSaved) {
            this.showSaved();
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error al cargar los datos del usuario actual:', error);
        }
      });

    } else {
      this.showPosts();
    }
  }

  getUserRatingCount(ownerId: number): void {
    this.ratingService.getUserRatingCount(ownerId).subscribe({
      next: (userRatingCount) => {
        this.userRatingCount = userRatingCount;
      },
      error: (error) => {
        console.error('Error al obtener la cantidad de valoraciones', error);
      },
    });
  }

  getRatingCount(owner: IUser): void {
    this.ratingService.getUserRatingCount(owner.id).subscribe({
      next: (ratingCount) => {
        owner.ratingCount = ratingCount;
      },
      error: (error) => {
        console.error('Error al obtener la cantidad de valoraciones', error);
      },
    });
  }

  getUserRatingAverage(ownerId: number): void {
    this.ratingService.getUserAverageRating(ownerId).subscribe({
      next: (userAverageRating) => {
        this.userAverageRating = userAverageRating;
      },
      error: (error) => {
        console.error('Error al obtener la valoración media', error);
      },
    });
  }

  getRatingAverage(owner: IUser): void {
    this.ratingService.getUserAverageRating(owner.id).subscribe({
      next: (ratingAverage) => {
        owner.ratingAverage = ratingAverage;
      },
      error: (error) => {
        console.error('Error al obtener la valoración media', error);
      },
    });
  }

  getStarIndexes(): number[] {
    const starCount = Math.floor(this.userAverageRating);
    return Array(starCount).fill(0).map((_, index) => index);
  }

  loadCars(): void {
    this.carService.getPage(100, 0, 'id', 'asc', this.user.id, this.searchFilterPosts).subscribe({
      next: (data) => {
        if (data.content.length === 0) {
          console.log('No se encontraron coches');
        }
        this.cars = data.content; // Asume que ICarPage tiene una propiedad content con los coches
        this.fillSavedCars();
      },
      error: (error) => {
        console.error('Error fetching cars:', error);
      }
    });
  }

  goToCar(id: number): void {
    this.router.navigate(['/car', id]);
    this.resetBehavior();
  }

  resetBehavior(): void {
    document.scrollingElement?.scrollTo({ top: 0, behavior: 'auto' });
    document.body.classList.remove('overflow-hidden');
    this.closeViewModal();
  }

  fillSavedCars(): void {
    const saveBtns = document.querySelectorAll('button.save-btn');
    saveBtns.forEach((btn) => {
      btn.classList.add('text-gray-800', 'hover:text-yellow-500');
      btn.classList.remove('text-yellow-500', 'hover:text-yellow-600');
    });

    // Verifica si this.currentUser está definido y es un número antes de continuar
    if (this.currentUser && typeof this.currentUser.id === 'number') {

      // Obtén los coches favoritos del usuario actual
      this.savedService.getSavedCars(this.currentUser.id).subscribe({
        next: (savedCars: ICar[]) => {
          savedCars.forEach((car: ICar) => {

            // Encuentra el botón asociado al coche y añade la clase 'saved' para pintarlo de azul
            const saveBtn = document.querySelectorAll(`button[data-car-id="${car.id}"]`);
            saveBtn.forEach((btn) => {

              if (btn) {
                btn.classList.add('text-yellow-500', 'hover:text-yellow-600');
                btn.classList.remove('text-gray-800', 'hover:text-yellow-500');
              }
            });
          });
        },
        error: (error: string) => {
          console.error('Error al obtener coches favoritos:', error);
        },
      });
    }
  }

  addToSaved(carId: number): void {
    const saveBtn = document.querySelectorAll(`button[data-car-id="${carId}"]`);

    this.savedService.addToSaved(this.currentUser.id, carId).subscribe({
      next: () => {
        this.getSavedCars();
        saveBtn.forEach((btn) => {
          if (btn) {
            btn.classList.remove('text-gray-800', 'hover:text-yellow-500');
            btn.classList.add('text-yellow-500', 'hover:text-yellow-600');
          }
        });
      },
      error: (error: string) => {
        console.error('Error al añadir coche a favoritos:', error);
      },
    });
  }

  removeFromSaved(carId: number): void {
    const saveBtn = document.querySelectorAll(`button[data-car-id="${carId}"]`);

    this.savedService.removeFromSaved(this.currentUser.id, carId).subscribe({
      next: () => {
        this.getSavedCars();
        saveBtn.forEach((btn) => {
          if (btn) {
            btn.classList.remove('text-yellow-500', 'hover:text-yellow-600');
            btn.classList.add('text-gray-800', 'hover:text-yellow-500');
          }
        });
      },
      error: (error: string) => {
        console.error('Error al eliminar coche de favoritos:', error);
      },
    });
  }

  handleFavorites(car: ICar): void {
    if (this.sessionService.isSessionActive()) {
      this.savedService.isSaved(this.currentUser.id, car.id).subscribe({
        next: (response: boolean) => {
          if (response) {
            this.removeFromSaved(car.id);
          } else {
            this.addToSaved(car.id);
          }
        }

      });
    } else {
      this.router.navigate(['/login']);
    }
  }

  openViewModal(event: MouseEvent, car: ICar): void {
    event.stopPropagation(); // Detiene la propagación del evento
    this.imageIndex[car.id] = 0; // Reinicia el índice de la imagen
    this.selectedCar = car; // Establece el coche seleccionado
    this.isViewModalVisible = true; // Muestra el modal
    this.getRatingCount(this.selectedCar.owner);
    this.getRatingAverage(this.selectedCar.owner);
    this.fillSavedCars();
    document.body.classList.add('overflow-hidden');
  }

  closeViewModal(): void {
    this.isViewModalVisible = false;
    this.selectedCar = {} as ICar; // Limpia el coche seleccionado
    document.body.classList.remove('overflow-hidden');
  }

  prevImage(event: MouseEvent, car: ICar) {
    event.stopPropagation(); // Detiene la propagación del evento
    this.imageIndex[car.id] = this.imageIndex[car.id] - 1;
  }

  nextImage(event: MouseEvent, car: ICar) {
    event.stopPropagation(); // Detiene la propagación del evento
    this.imageIndex[car.id] = this.imageIndex[car.id] + 1;
  }

  changePageCarousel(index: number, car: ICar) {
    this.imageIndex[car.id] = index;
  }

  onSearchPosts(): void {
    this.loadCars();
  }

  onSearchSaved(): void {
    this.getSavedCars();
  }

  isCurrentUserOwner(): boolean {
    return this.user.id === this.currentUser.id || this.currentUser.role === true;
  }

  isCurrentUserAdmin(): boolean {
    return this.currentUser.role === true;
  }

  isDifferentUser(): boolean {
    return this.user.id !== this.currentUser.id;
  }

  openDeleteModal(id: number): void {
    this.idToDelete = id;
    this.isDeleteModalVisible = true;
  }

  closeDeleteModal(): void {
    this.isDeleteModalVisible = false;
    this.idToDelete = null;
  }

  deleteUser(): void {
    if (this.idToDelete) {
      this.userService.remove(this.idToDelete).subscribe({
        next: () => {
          this.closeDeleteModal();
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('Error deleting the user', error);
          this.closeDeleteModal();
        }
      });
    }
  }

  deleteCar(carId: number): void {
    this.carService.remove(carId).subscribe({
      next: () => {
        this.loadCars();
        this.getSavedCars();
        this.closeViewModal();
      },
      error: (error) => {
        console.error('Error deleting the car', error);
      }
    });
  }

  goToProfile() {
    window.location.href = '/user/' + this.user.id;
  }

  showInfo(): void {
    const container = document.getElementById('tabContainer');
    this.isInfoShown = true;
    this.isPostsShown = false;
    this.isSavedShown = false;

    if (container) {
      container.style.transform = 'translateX(0)';
    }
  }

  showPosts(): void {
    const container = document.getElementById('tabContainer');
    this.isInfoShown = false;
    this.isPostsShown = true;
    this.isSavedShown = false;

    if (container) {
      container.style.transform = 'translateX(-33.333%)';
    }
  }

  showSaved(): void {
    const container = document.getElementById('tabContainer');
    this.isInfoShown = false;
    this.isPostsShown = false;
    this.isSavedShown = true;

    if (innerWidth < 768) {
      document.scrollingElement?.scrollTo({ top: 630, behavior: 'smooth' });
    }


    if (container) {
      if (this.savedCars.length === 0) {
        container.classList.add('h-[30]');
        container.classList.remove('h-[51]');
      } else {
        container.classList.remove('h-[30]');
        container.classList.add('h-[51]');
      }
      container.style.transform = 'translateX(-66.666%)';
    }
  }

  getSavedCars(): void {
    this.savedService.getSavedCars(this.user.id, this.searchFilterSaved).subscribe({
      next: (savedCars: ICar[]) => {
        this.savedCars = savedCars;
        this.fillSavedCars();
      },
      error: (error: string) => {
        console.error('Error al obtener coches favoritos:', error);
      },
    });
  }

  getUserInitials(): string {
    if (this.user.name && this.user.lastname) {
      return `${this.user.name.charAt(0)}${this.user.lastname.charAt(0)}`.toUpperCase();
    }
    return '';
  }

  onPictureSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (this.checkFileSizePicture(file)) {
        if (this.checkFileType(file)) {
          this.uploadPicture(file);
        } else {
          this.hasError = true;
          this.errorMessage = 'The file selected is not an image';
          setTimeout(() => {
            this.hasError = false;
          }, 3000);
          return;
        }
      } else {
        this.hasError = true;
        this.errorMessage = 'The file selected exceeds the maximum allowed size';
        setTimeout(() => {
          this.hasError = false;
        }, 3000);
        return;
      }
    }
  }

  onBackgroundSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (this.checkFileSizeBackground(file)) {
        if (this.checkFileType(file)) {
          this.uploadBackground(file);
        } else {
          this.hasError = true;
          this.errorMessage = 'The file selected is not an image';
          setTimeout(() => {
            this.hasError = false;
          }, 3000);
          return;
        }
      } else {
        this.hasError = true;
        this.errorMessage = 'The file selected exceeds the maximum allowed size';
        setTimeout(() => {
          this.hasError = false;
        }, 3000);
        return;
      }
    }
  }

  uploadPicture(file: File): void {
    const formData = new FormData();
    formData.append('file', file);
    this.mediaService.uploadPicture(formData, this.user.id).subscribe({
      next: () => {
        this.userService.get(this.id).subscribe({
          next: (user: IUser) => {
            this.user = user;
          },
          error: (error: HttpErrorResponse) => {
            console.error('Error al cargar los datos del usuario:', error);
          }
        })
      },
      error: (error) => {
        console.error('Error al subir la imagen:', error);
      }
    });
  }

  uploadBackground(file: File): void {
    const formData = new FormData();
    formData.append('file', file);
    this.mediaService.uploadBackground(formData, this.user.id).subscribe({
      next: () => {
        this.userService.get(this.id).subscribe({
          next: (user: IUser) => {
            this.user = user;
          },
          error: (error: HttpErrorResponse) => {
            console.error('Error al cargar los datos del usuario:', error);
          }
        })
      },
      error: (error) => {
        console.error('Error al subir la imagen:', error);
      }
    });
  }

  checkFileSizePicture(file: File): boolean {
    const maxSizeInBytes = 2 * 1024 * 1024; // Tamaño máximo permitido en bytes (2 MB en este ejemplo)
    return file.size <= maxSizeInBytes;
  }

  checkFileSizeBackground(file: File): boolean {
    const maxSizeInBytes = 6 * 1024 * 1024; // Tamaño máximo permitido en bytes (6 MB en este ejemplo)
    return file.size <= maxSizeInBytes;
  }

  checkFileType(file: File): boolean {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']; // Tipos MIME permitidos
    return allowedTypes.includes(file.type);
  }

  dateToString(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  async setEditable(): Promise<void> {
    const editables = document.querySelectorAll('.editable');
    if (this.setContentEditable) {
      this.user.name = document.getElementById('name')?.textContent || '';
      this.user.lastname = document.getElementById('lastname')?.textContent || '';
      let username: string = document.getElementById('username')?.textContent || '';
      this.user.phone = document.getElementById('phone')?.textContent || '';
      this.user.description = this.description;

      // Validaciones de los campos de texto
      if (this.user.name === '' || this.user.lastname === '' || username === '' || this.user.phone === '') {
        this.hasError = true;
        this.errorMessage = 'All fields are required';

        setTimeout(() => {
          this.hasError = false;
        }, 3000);
      } else if (this.user.phone.length !== 9) {
        this.hasError = true;
        this.errorMessage = 'The phone number must be 9 digits';

        setTimeout(() => {
          this.hasError = false;
        }, 3000);
      } else if (this.user.name.length > 20) {
        this.hasError = true;
        this.errorMessage = 'The name limit is 20 characters';

        setTimeout(() => {
          this.hasError = false;
        }, 3000);
      } else if (this.user.lastname.length > 20) {
        this.hasError = true;
        this.errorMessage = 'The lastname limit is 20 characters';

        setTimeout(() => {
          this.hasError = false;
        }, 3000);
      } else if (username.length > 15) {
        this.hasError = true;
        this.errorMessage = 'The username limit is 15 characters';

        setTimeout(() => {
          this.hasError = false;
        }, 3000);
      } else if (this.user.name.length < 3) {
        this.hasError = true;
        this.errorMessage = 'The name must have at least 3 characters';

        setTimeout(() => {
          this.hasError = false;
        }, 3000);
      } else if (this.user.lastname.length < 3) {
        this.hasError = true;
        this.errorMessage = 'The lastname must have at least 3 characters';

        setTimeout(() => {
          this.hasError = false;
        }, 3000);
      } else if (username.length < 3) {
        this.hasError = true;
        this.errorMessage = 'The username must have at least 3 characters';

        setTimeout(() => {
          this.hasError = false;
        }, 3000);
      } else if (this.user.description.length > 500) {
        this.hasError = true;
        this.errorMessage = 'The description limit is 500 characters';

        setTimeout(() => {
          this.hasError = false;
        }, 3000);
      } else if (this.user.description.length < 5) {
        this.hasError = true;
        this.errorMessage = 'The description must have at least 5 characters';

        setTimeout(() => {
          this.hasError = false;
        }, 3000);
      }

      // Verificación de la disponibilidad del nombre de usuario
      const isAvailable = await this.checkUsername(username);
      if (isAvailable) {
        this.user.username = username;
      } else {
        this.hasError = true;
        this.errorMessage = 'The username is already taken';

        setTimeout(() => {
          this.hasError = false;
        }, 3000);
      }

      if (this.hasError) return;

      // Actualización de los datos del usuario
      this.userService.update(this.user).subscribe({
        next: (user: IUser) => {
          this.user = user;
          if (user.id === this.currentUser.id) {
            const token = localStorage.getItem('token');
            if (token) {
              this.login(user.username, token);
            }
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error al actualizar los datos del usuario:', error);
        }
      });
    } else {
      this.toastService.show('Aun no se ha actualizado la información');
    }

    this.setContentEditable = !this.setContentEditable;
    this.showInfo();

    if (this.marker) {
      this.marker.setDraggable(this.setContentEditable);

      if (this.setContentEditable) {
        this.marker.removeClassName('hidden');
      } else {
        this.marker.addClassName('hidden');
      }

      this.marker.on('dragend', () => {
        const lngLat = this.marker?.getLngLat();
        if (lngLat) {
          this.user.location = `${lngLat.lng} ${lngLat.lat}`;
          this.reverseGeocode(lngLat.lng, lngLat.lat);
        }
      });

      if (this.map) {
        this.map.on('click', (e) => {
          if (this.setContentEditable) {
            const lngLat = e.lngLat;
            this.marker?.setLngLat([lngLat.lng, lngLat.lat]);
            this.user.location = `${lngLat.lng} ${lngLat.lat}`;
            this.reverseGeocode(lngLat.lng, lngLat.lat);
          }
        });
      }
    }

    editables.forEach((editable) => {
      editable.setAttribute('contenteditable', this.setContentEditable.toString());
    });
  }

  reverseGeocode(lng: number, lat: number) {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${this.mapboxApiKey}`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        this.place = data.features;
        if (data.features && data.features.length > 0) {

          this.user.city = data.features[2].place_name.split(',')[0].trim();
          this.user.country = data.features[data.features.length - 1].place_name.trim();

          if (isNaN(parseInt(this.user.city))) {
            this.user.city = data.features[2].place_name.split(',')[0].trim();
          } else {
            this.user.city = data.features[2].place_name.split(',')[1].trim();
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

  onlyNumberKey(event: any) {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
    }
  }

  // Método para verificar la disponibilidad del nombre de usuario
  checkUsername(username: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.userService.getByUsername(username).subscribe({
        next: (user: IUser) => {
          if (this.user.username === username) {
            console.log('El nombre de usuario es el mismo');
            resolve(true);
          } else {
            console.log('El nombre de usuario ya está en uso por otro usuario');
            resolve(false);
          }
        },
        error: () => {
          console.log('Está libre el nombre de usuario');
          resolve(true);
        }
      });
    });
  }

  login(username: string, passw: string): void {
    this.sessionService.login(username, passw).subscribe({
      next: (data: string) => {
        this.sessionService.setToken(data);
        this.sessionService.emit({ type: 'login' });
        this.router.navigate(['/user', this.currentUser.id]);
      },
      error: (error: HttpErrorResponse) => {

      }
    });
  }

  //navigate to chat page with the information of the car and members on the chat attached
  //update the method to check if there is a chat with the user and the currentUser
  loadChat(): void {
    if (!this.sessionService.isSessionActive()) {
      this.router.navigate(['/login']);
    } else {
      if (!this.currentUser.actived) {
        this.router.navigate(['/activate']);
      } else {

        if (this.user.id === this.currentUser.id) {
          console.error('No puedes chatear contigo mismo');
          //toast here
          return;
        } else {
          // Comprobación de si ya existe un chat entre los usuarios
          this.chatService.getByUsers(this.currentUser, this.user).subscribe({
            next: (chat: IChat) => {
              if (chat) {

                chat.memberOne = this.user;
                chat.memberTwo = this.currentUser;
                // Si ya existe un chat, redirigir al chat existente
                this.router.navigate(['/chats', { chat: encodeURIComponent(JSON.stringify(chat)) }]);
              } else {
                // Si no existe un chat, crear uno nuevo
                const newChat = {
                  memberOne: this.user,
                  memberTwo: this.currentUser,
                  car: null,
                  notifications: 0,
                  creationDate: new Date()
                };

                const chatData = encodeURIComponent(JSON.stringify(newChat));
                this.router.navigate(['/chats', { chat: chatData }]);
              }
            },
            error: (error) => {
              console.error('Error al cargar el chat:', error);
              //toast here
            }
          });
        }
      }
    }
  }
}
