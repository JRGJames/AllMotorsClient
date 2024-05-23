import { UserService } from '../../../../service/user.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ICar, IImage, IUser } from 'src/app/model/model';
import { CarService } from 'src/app/service/car.service';
import { RatingService } from 'src/app/service/rating.service';
import { SessionService } from 'src/app/service/session.service';
import { API_URL_MEDIA } from 'src/environment/environment';
import { ChartComponent, ApexAxisChartSeries, ApexChart, ApexXAxis, ApexTitleSubtitle, ApexYAxis, ApexStroke, ApexMarkers, ApexFill, ApexTooltip, ApexDataLabels } from "ng-apexcharts";
import { SavedService } from 'src/app/service/saved.service';
import { MediaService } from 'src/app/service/media.service';
import { Map, MapStyle, config, Marker } from '@maptiler/sdk';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  stroke: ApexStroke;
  fill: ApexFill;
  dataLabels: ApexDataLabels
  markers: ApexMarkers;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  tooltip: ApexTooltip;
  title: ApexTitleSubtitle;
};

@Component({
  selector: 'app-car-detail',
  templateUrl: './car-detail.component.html',
  styleUrls: ['./car-detail.component.css'],
})
export class CarDetailComponent implements OnInit {
  @ViewChild('userList') userList!: ElementRef;
  @ViewChild('colorPicker') colorPicker!: ElementRef;
  @ViewChild('map')
  private mapContainer!: ElementRef;
  map: Map | undefined;
  marker: Marker | undefined;

  urlImage = API_URL_MEDIA;
  showPhoneNumber: boolean = false;
  id!: number;
  imageIndex: number = 0;
  averageRating: number = 0;
  ratingCount: number = 0;
  car: ICar = { owner: {} } as ICar;
  status: HttpErrorResponse | null = null;
  currentUser: IUser = {} as IUser;
  isDeleteModalVisible: boolean = false;
  idToDelete: number | null = null;
  setContentEditable: boolean = false;
  users: IUser[] = [];
  imageToAdd: IImage = {} as IImage;
  coords: { lat: number, lng: number } = { lat: 0, lng: 0 };
  mapboxApiKey: string = 'pk.eyJ1IjoiamF1bWVyb3NlbGxvLTMzIiwiYSI6ImNsd2lma2ZrNDBrMmsyaXVrNjg5MHdwaXMifQ.XAI3t3FSV6-z-RE8NbJ-cw';

  isEditingOwner: boolean = false;
  selectedUser: string = "";
  isEditingColor: boolean = false;
  isEditingFuel: boolean = false;
  isEditingGearbox: boolean = false;
  isEditingDrive: boolean = false;
  isEditingType: boolean = false;
  isEditingBrand: boolean = false;
  isEditingModel: boolean = false;
  isEditingImages: boolean = false;

  colors: { color: string, hex: string }[] = [
    { color: 'black', hex: '#1F2937' },
    { color: 'maroon', hex: '#800000' },
    { color: 'brown', hex: '#A52A2A' },
    { color: 'red', hex: '#D92518' },
    { color: 'orange', hex: '#FFA500' },
    { color: 'yellow', hex: '#FFC107' },
    { color: 'olive', hex: '#808000' },
    { color: 'lime', hex: '#00FF00' },
    { color: 'green', hex: '#2ECC71' },
    { color: 'teal', hex: '#008080' },
    { color: 'cyan', hex: '#00FFFF' },
    { color: 'blue', hex: '#0284C7' },
    { color: 'navy', hex: '#000080' },
    { color: 'indigo', hex: '#4B0082' },
    { color: 'purple', hex: '#800080' },
    { color: 'magenta', hex: '#FF00FF' },
    { color: 'pink', hex: '#FFC0CB' },
    { color: 'grey', hex: '#8C8C8C' },
    { color: 'silver', hex: '#C0C0C0' },
    { color: 'white', hex: '#FFFFFF' }
  ];
  fuelTypes: string[] = ['gasoline', 'diesel', 'hybrid', 'electric'];
  gearboxTypes: string[] = ['manual', 'automatic'];
  driveTypes: string[] = ['FWD', 'RWD', '4WD', 'AWD'];
  brands: string[] = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];
  models: string[] = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];
  carTypes: string[] = ['sedan', 'coupe', 'convertible', 'hatchback', 'SUV', 'pickup', 'van', 'minivan', 'truck', 'quad', 'tractor', 'trailer', 'other'];

  chartOptions: Partial<ChartOptions> = {
    series: [
      {
        name: "Price",
        data: [20, 15, 5, 16],
        color: "#0284C7"
      }
    ],
    chart: {
      height: 300,
      type: "area",
      zoom: {
        enabled: false
      },
      toolbar: {
        show: false
      }
    },
    title: {
      text: "Price history",
      align: "left",
      style: {
        fontSize: '20px',
        fontWeight: 'bold',
        fontFamily: 'sans-serif',
        color: '#1F2937'
      },

    },
    stroke: {
      curve: "smooth"
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 1,
        opacityTo: 0.8,
      }
    },
    markers: {
      size: 6
    },
    yaxis: {
      min: 0,
      title: {
        rotate: 360,
        offsetY: 0,
        style: {
          fontSize: '16px',
          fontWeight: 'bold',
          fontFamily: 'sans-serif',
          color: '#1F2937'
        }
      },
      stepSize: 10,
      tooltip: {
        enabled: false
      }
    },
    xaxis: {
      categories: ["1", "2", "3", "4"],
      tooltip: {
        enabled: false
      },
      title: {
        text: "Months",
        style: {
          fontSize: '16px',
          fontWeight: 'bold',
          fontFamily: 'sans-serif',
          color: '#1F2937'
        }
      }
    },
    tooltip: {
      enabled: true,
      x: {
        show: false
      },

      y: {
        formatter: function (value: number) {
          return value + "€";
        }
      }
    },
    dataLabels: {
      enabled: false
    }
  };
  chart: ChartComponent = Object.create(this.chartOptions);

  constructor(
    private carService: CarService,
    private sessionService: SessionService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private ratingService: RatingService,
    private savedService: SavedService,
    private mediaService: MediaService
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.id = +params['id'];
      if (this.id) {
        this.getCurrentUser();
        this.getOne(this.id);
        this.increaseViews(this.id);
        config.apiKey = 'Apyyhkp723bQ0aHy4fgs';
      } else {
        console.error('ID is undefined');
      }
    });
  }

  ngOnDestroy() {
    this.map?.remove();
  }

  getCurrentUser(): void {
    if (this.sessionService.isSessionActive()) {
      const username = this.sessionService.getUsername();
      this.userService.getByUsername(username).subscribe({
        next: (user: IUser) => {
          this.currentUser = user;
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error al cargar los datos del usuario actual:', error);
        }
      });
    }
  }

  getOne(carId: number): void {
    this.carService.get(carId).subscribe({
      next: (data: ICar) => {
        this.car = data;
        this.getRatingCount(this.car.owner.id);
        this.getRatingAverage(this.car.owner.id);
        this.checkIfCarIsSaved(this.car.id);
        this.selectedUser = this.car.owner.username;
        this.coords = {
          lng: parseFloat(this.car.location.split(' ')[0]),
          lat: parseFloat(this.car.location.split(' ')[1])
        };

        const initialState = {
          lat: this.coords.lat,
          lng: this.coords.lng,
          zoom: 15
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

        this.marker.setLngLat([initialState.lng, initialState.lat]).addTo(this.map);
      },
      error: (error: HttpErrorResponse) => {
        this.status = error;
      }
    });
  }

  prevImage() {
    this.imageIndex--;
  }

  nextImage() {
    this.imageIndex++;
  }

  changePage(newPage: number) {
    this.imageIndex = newPage;
  }

  togglePhoneNumber(): void {
    this.showPhoneNumber = !this.showPhoneNumber;
  }

  getRatingCount(ownerId: number): void {
    this.ratingService.getUserRatingCount(ownerId).subscribe({
      next: (ratingCount) => {
        this.ratingCount = ratingCount;
      },
      error: (error) => {
        console.error('Error al obtener la cantidad de valoraciones', error);
      },
    });
  }

  getRatingAverage(ownerId: number): void {
    this.ratingService.getUserAverageRating(ownerId).subscribe({
      next: (averageRating) => {
        this.averageRating = averageRating;
      },
      error: (error) => {
        console.error('Error al obtener la valoración media', error);
      },
    });
  }

  increaseViews(carId: number): void {
    this.carService.get(carId).subscribe({
      next: (car: ICar) => {
        car.views++;
        this.car = car;

        this.carService.update(car).subscribe({
          next: (car: ICar) => {
            this.car = car;
          },
          error: (error: HttpErrorResponse) => {
            console.error('Error al aumentar las visitas:', error);
          }
        });
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error al aumentar las visitas:', error);
      }
    });


  }

  handleFavorites(car: ICar): void {
    if (this.sessionService.isSessionActive()) {
      this.closeDropdowns();
      this.savedService.isSaved(this.currentUser.id, car.id).subscribe({
        next: (response: boolean) => {
          if (response) {
            this.removeFromSaved(car.id);
            this.decreaseSaves(car.id);
          } else {
            this.addToSaved(car.id);
            this.increaseSaves(car.id);
          }
        }
      });
    } else {
      this.router.navigate(['/login']);
    }
  }

  addToSaved(carId: number): void {
    const saveBtn = document.querySelectorAll(`button[data-car-id="${carId}"]`);

    this.savedService.addToSaved(this.currentUser.id, carId).subscribe({
      next: () => {
        saveBtn.forEach((btn) => {
          if (btn) {
            btn.classList.remove('text-gray-800', 'hover:text-yellow-500');
            btn.classList.add('text-yellow-500', 'hover:text-yellow-600');
          }
        });
        this.getOne(carId);
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
        saveBtn.forEach((btn) => {
          if (btn) {
            btn.classList.remove('text-yellow-500', 'hover:text-yellow-600');
            btn.classList.add('text-gray-800', 'hover:text-yellow-500');
          }
        });
        this.getOne(carId);
      },
      error: (error: string) => {
        console.error('Error al eliminar coche de favoritos:', error);
      },
    });
  }

  increaseSaves(carId: number): void {
    this.savedService.increaseSaves(carId).subscribe({
      next: () => {
      },
      error: (error: string) => {
        console.error('Error al aumentar el contador de favoritos:', error);
      },
    });
  }

  decreaseSaves(carId: number): void {
    this.savedService.decreaseSaves(carId).subscribe({
      next: () => {
      },
      error: (error: string) => {
        console.error('Error al disminuir el contador de favoritos:', error);
      },
    });
  }

  checkIfCarIsSaved(carId: number): void {
    if (this.sessionService.isSessionActive()) {
      this.savedService.isSaved(this.currentUser.id, carId).subscribe({
        next: (response: boolean) => {
          const saveBtn = document.querySelectorAll(`button[data-car-id="${carId}"]`);

          if (response) {
            saveBtn.forEach((btn) => {
              if (btn) {
                btn.classList.remove('text-gray-800', 'hover:text-yellow-500');
                btn.classList.add('text-yellow-500', 'hover:text-yellow-600');
              }
            });
          } else {
            saveBtn.forEach((btn) => {
              if (btn) {
                btn.classList.remove('text-yellow-500', 'hover:text-yellow-600');
                btn.classList.add('text-gray-800', 'hover:text-yellow-500');
              }
            });
          }
        },
        error: (error: string) => {
          console.error('Error al comprobar si el coche está en favoritos:', error);
        },
      });
    }
  }

  isCurrentUserOwner(selectedCar: ICar): boolean {
    return selectedCar.owner.id === this.currentUser.id || this.currentUser.role === true;
  }

  openDeleteModal(id: number): void {
    this.idToDelete = id;
    this.isDeleteModalVisible = true;
  }

  closeDeleteModal(): void {
    this.isDeleteModalVisible = false;
    this.idToDelete = null;
  }

  // Función para manejar la eliminación
  deleteCar(): void {
    if (this.idToDelete) {
      this.carService.remove(this.idToDelete).subscribe({
        next: () => {
          this.closeDeleteModal();
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('Error deleting the car', error);
          this.closeDeleteModal();
        }
      });
    }
  }

  setEditable(): void {
    const editables = document.querySelectorAll('.editable');

    this.loadUsers();
    if (this.setContentEditable) {
      this.isEditingFuel = false;
      this.isEditingOwner = false;
      this.isEditingColor = false;
      this.isEditingGearbox = false;
      this.isEditingDrive = false;
      this.isEditingType = false;
      this.isEditingBrand = false;
      this.isEditingModel = false;
      this.isEditingImages = false;



      // Actualizamos los datos del usuario
      this.car.title = document.getElementById('title')?.innerText || '';

      const priceText = document.getElementById('price')?.innerText || '';
      this.car.price = Number(priceText.replace('.', ''));

      this.car.year = Number(document.getElementById('year')?.innerText);
      this.car.seats = Number(document.getElementById('seats')?.innerText);
      this.car.doors = Number(document.getElementById('doors')?.innerText);
      this.car.description = document.getElementById('description')?.innerText || '';

      const distanceText = document.getElementById('distance')?.innerText || '';
      this.car.distance = Number(distanceText.replace('.', ''));

      const horsepowerText = document.getElementById('horsepower')?.innerText || '';
      this.car.horsepower = Number(horsepowerText.replace('.', ''));

      this.car.consumption = Number(document.getElementById('consumption')?.innerText);
      this.car.emissions = Number(document.getElementById('emissions')?.innerText);
      this.car.acceleration = Number(document.getElementById('acceleration')?.innerText);
      this.car.lastUpdate = new Date();

      this.carService.update(this.car).subscribe({
        next: (car: ICar) => {
          this.car = car;
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error al actualizar los datos del coche:', error);
        }
      });

    } else {
      console.error('Aun no se ha actualizado la información');
    }

    this.setContentEditable = !this.setContentEditable;

    // Update the car location and city

    if (this.marker) {
      this.marker.setDraggable(this.setContentEditable);

      this.marker.on('dragend', () => {
        const lngLat = this.marker?.getLngLat();

        if (lngLat) {
          this.car.location = `${lngLat.lng} ${lngLat.lat}`;
          this.reverseGeocode(lngLat.lng, lngLat.lat);
        }
      });

      if (this.map) {
        this.map.on('click', (e) => {

          if (this.setContentEditable) {
            const lngLat = e.lngLat;

            this.marker?.setLngLat([lngLat.lng, lngLat.lat]);
            this.car.location = `${lngLat.lng} ${lngLat.lat}`;
            this.reverseGeocode(lngLat.lng, lngLat.lat);
          }
        });
      }
    }

    editables.forEach((editable) => {
      if (this.setContentEditable) {
        editable.setAttribute('contenteditable', 'true');
      } else {
        editable.setAttribute('contenteditable', 'false');
      }
    });
  }

  reverseGeocode(lng: number, lat: number) {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${this.mapboxApiKey}`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.features && data.features.length > 0) {

          this.car.city = data.features[2].place_name.split(',')[0].trim();


          if (isNaN(parseInt(this.car.city))) {
            this.car.city = data.features[2].place_name.split(',')[0].trim();
          } else {
            this.car.city = data.features[2].place_name.split(',')[1].trim();
          }
        } else {
          console.log('No features in data');
        }
      })
      .catch(error => console.log('Error:', error));
  }

  loadUsers(): void {
    this.userService.getAll().subscribe({
      next: (users: IUser[]) => {
        this.users = users;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error al cargar los usuarios:', error);
      }
    });
  }

  selectUser(userId: number): void {
    this.car.owner.id = userId;
    this.isEditingOwner = !this.isEditingOwner;
    this.userService.get(userId).subscribe({
      next: (user: IUser) => {
        this.selectedUser = user.username;
      }
    });
  }

  selectColor(color: string): void {
    this.car.color = color;
    this.isEditingColor = !this.isEditingColor;
  }

  getUserInitials(user: IUser): string {
    if (user.name && user.lastname) {
      return `${user.name.charAt(0)}${user.lastname.charAt(0)}`.toUpperCase();
    }
    return '';
  }

  deleteImage(imageId: number): void {
    if (this.car.images.length <= 2) {
      console.error('Se deben subir minimo 2 imágenes');
    } else {
      this.mediaService.deleteCarImage(imageId).subscribe({
        next: () => {
          this.getOne(this.car.id);
          if (this.imageIndex === 0) {
            this.imageIndex = 0;
          } else {
            this.imageIndex--;
          }
        },
        error: (error) => {
          console.error('Error al eliminar la imagen:', error);
        }
      });
    }
  }

  addImage(file: File): void {
    if (this.car.images.length >= 8) {
      console.error('No se pueden añadir más de 8 imágenes');
      // toast here
    } else {
      const formData = new FormData();
      formData.append('file', file);
      this.mediaService.createCarImage(formData, this.car.id).subscribe({
        next: (image) => {
          this.car.images.push(image);
          this.imageIndex = this.car.images.length - 1;
          this.getOne(this.car.id);
        },
        error: (error) => {
          console.error('Error al añadir imagen:', error);
        }
      });
    }
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (this.checkFileSizeImage(file)) {
        if (this.checkFileType(file)) {
          this.addImage(file);
        } else {
          //this.toastService.show('El archivo seleccionado no es una imagen.');
          console.error('El archivo seleccionado no es una imagen.');
          return;
        }
      } else {
        //this.toastService.show('El archivo seleccionado excede el tamaño máximo permitido.');
        console.error('El archivo seleccionado excede el tamaño máximo permitido.');
        return;
      }
    }
  }

  checkFileSizeImage(file: File): boolean {
    const maxSizeInBytes = 6 * 1024 * 1024; // Tamaño máximo permitido en bytes (2 MB en este ejemplo)
    return file.size <= maxSizeInBytes;
  }

  checkFileType(file: File): boolean {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']; // Tipos MIME permitidos
    return allowedTypes.includes(file.type);
  }

  closeDropdowns(): void {
    this.isEditingFuel = false;
    this.isEditingOwner = false;
    this.isEditingColor = false;
    this.isEditingGearbox = false;
    this.isEditingDrive = false;
    this.isEditingType = false;
    this.isEditingBrand = false;
    this.isEditingModel = false;
    this.isEditingImages = false;
  }
}
