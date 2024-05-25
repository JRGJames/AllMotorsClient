import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, AfterViewInit, Input, OnInit, Renderer2, ViewChild, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ICar, IImage, IUser, formOperation } from 'src/app/model/model';
import { CarService } from '../../../../service/car.service';
import { UserService } from '../../../../service/user.service';
import { SessionService } from '../../../../service/session.service';
import { Router } from '@angular/router';
import { MediaService } from 'src/app/service/media.service';
import { API_URL_MEDIA } from 'src/environment/environment';
import { Map, MapStyle, config, Marker, NavigationControl, MaptilerNavigationControl, GeolocationType, LngLat } from '@maptiler/sdk';
import { last, Observable, of, switchMap } from 'rxjs';


@Component({
  selector: 'app-car-form',
  templateUrl: './car-form.component.html',
  styleUrls: ['./car-form.component.css']
})
export class CarFormComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() id: number = 1;
  @Input() operation: formOperation = 'NEW'; // new or edit

  @ViewChild('descriptionSpan', { static: true }) descriptionSpan: ElementRef = {} as ElementRef;
  @ViewChild('ownerInput') ownerInput: ElementRef = {} as ElementRef;
  @ViewChild('map')
  private mapContainer!: ElementRef;
  map: Map | undefined;
  marker: Marker | undefined;

  description: string = '';

  imageIndex: number = 0;
  selectedFiles: File[] = []; // Este array solo contendrá objetos File
  carForm!: FormGroup;
  car: ICar = {} as ICar;
  currentUser: IUser = {} as IUser;
  status: HttpErrorResponse | null = null;
  user: IUser = {} as IUser;
  temporaryCar: ICar = {} as ICar;

  titleBrand: string = '';
  titleModel: string = '';
  title: string = this.titleBrand + this.titleModel;
  city: string = '';
  mapboxApiKey: string = 'pk.eyJ1IjoiamF1bWVyb3NlbGxvLTMzIiwiYSI6ImNsd2lma2ZrNDBrMmsyaXVrNjg5MHdwaXMifQ.XAI3t3FSV6-z-RE8NbJ-cw';

  urlImage = API_URL_MEDIA;

  images: IImage[] = [];
  users: IUser[] = [];
  years: number[] = [];
  brands: string[] = [
    'Audi', 'Rolls Royce', 'BMW', 'Chevrolet', 'Citroen', 'Fiat', 'Ford', 'Honda', 'Hyundai', 'Kia', 'Mazda', 'Mercedes-Benz', 'Nissan', 'Opel', 'Peugeot', 'Renault', 'Seat', 'Skoda', 'Toyota', 'Volkswagen', 'Volvo'
  ];
  models: string[] = [
    'E46 X', 'E90', 'E92', 'F30', 'F32', 'F80', 'F82', 'F87', 'G20', 'G22', 'G80', 'G82', 'G87', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q3', 'Q5', 'Q7', 'Q8', 'TT', 'R8', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'RS3', 'RS4', 'RS5', 'RS6', 'RS7', 'RSQ3', 'RSQ8', 'RSQ5', 'RSQ7'
  ];
  gearboxTypes: string[] = ['manual', 'automatic'];
  fuelTypes: string[] = ['gasoline', 'diesel', 'electric', 'hybrid'];
  currencies: string[] = ['€', '$', '£', '¥', '₽'];
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
  driveTypes: string[] = ['fwd', 'rwd', '4wd', 'awd'];
  carTypes: string[] = ['sedan', 'coupe', 'convertible', 'hatchback', 'SUV', 'pickup', 'van', 'truck', 'other'];


  backgroundImage: string = `url(assets/images/image1.webp)`;
  inputImage: string = `url(assets/images/image4.webp)`;

  showBrands: boolean = false;
  showModels: boolean = false;
  showYears: boolean = false;
  showColors: boolean = false;
  showUsers: boolean = false;
  showCarTypes: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private carService: CarService,
    private userService: UserService,
    private sessionService: SessionService,
    private renderer: Renderer2,
    private router: Router,
    private mediaService: MediaService,
    private http: HttpClient
  ) {
    this.initializeForm(this.car);
  }

  initializeForm(car: ICar) {
    this.carForm = this.formBuilder.group({
      owner: [car.owner, [Validators.required]],
      title: [car.title, [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
      brand: [car.brand, [Validators.required]],
      model: [car.model, [Validators.required]],
      price: [car.price, [Validators.required, Validators.min(1)]],
      currency: [car.currency, [Validators.required]],
      year: [car.year, [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear())]],
      color: [car.color, [Validators.required]],
      seats: [car.seats, [Validators.required, Validators.min(1), Validators.max(8)]],
      doors: [car.doors, [Validators.required, Validators.min(1), Validators.max(5)]],
      description: [car.description, [Validators.required, Validators.minLength(5), Validators.maxLength(2000)]],
      location: [car.location, [Validators.required]],
      city: [car.city, [Validators.required]],
      gearbox: [car.gearbox, [Validators.required]],
      fuel: [car.fuel, [Validators.required]],

      horsepower: [car.horsepower],
      distance: [car.distance],
      type: [car.type],
      emissions: [car.emissions, [Validators.min(0)]],
      consumption: [car.consumption, [Validators.min(0)]],
      acceleration: [car.acceleration, [Validators.min(0)]],
      drive: [car.drive],
    });
  }

  ngOnInit() {
    this.getCurrentUser()
    this.initializeForm(this.car);
    this.loadUsers();
    this.loadYears();
    this.loadBrands();

    config.apiKey = 'Apyyhkp723bQ0aHy4fgs';

    this.title = this.titleBrand + this.titleModel;

    this.userService.getByUsername(this.sessionService.getUsername()).subscribe({
      next: (data: IUser) => {
        this.user = data;
        this.carForm.patchValue({ owner: this.currentUser.username });
      },
      error: (error: HttpErrorResponse) => {
        this.status = error;
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
        this.carForm.patchValue({ location: lngLat.lng.toString() + ' ' + lngLat.lat.toString() });
        this.reverseGeocode(lngLat.lng, lngLat.lat);
      }
    });

    this.map.on('click', (e) => {
      const lngLat = e.lngLat;
      this.marker?.setLngLat([lngLat.lng, lngLat.lat]);
      this.carForm.patchValue({ location: lngLat.lng.toString() + ' ' + lngLat.lat.toString() });
      this.reverseGeocode(lngLat.lng, lngLat.lat);
    });
  }

  ngOnDestroy() {
    this.map?.remove();
  }

  reverseGeocode(lng: number, lat: number) {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${this.mapboxApiKey}`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.features && data.features.length > 0) {

          this.city = data.features[2].place_name.split(',')[0].trim();


          if (isNaN(parseInt(this.city))) {
            this.city = data.features[2].place_name.split(',')[0].trim();
          } else {
            this.city = data.features[2].place_name.split(',')[1].trim();
          }

          this.carForm.patchValue({ location: lng.toString() + ' ' + lat.toString() });
          this.carForm.patchValue({ city: this.city });
        } else {
          console.log('No features in data');
        }
      })
      .catch(error => console.log('Error:', error));
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

  closeDropdowns() {
    this.showBrands = false;
    this.showModels = false;
    this.showYears = false;
    this.showColors = false;
    this.showUsers = false;
    this.showCarTypes = false;
  }

  changeTitleBrand(event: any) {
    this.title = event.target.value;
    this.titleBrand = event.target.value;
    document.getElementById('title')?.setAttribute('value', this.title);
    document.getElementById('model')?.focus();
    this.carForm.patchValue({
      title: this.title
    });
  }

  changeTitleModel(event: any) {
    this.title += ' ' + event.target.value;
    this.carForm.patchValue({
      title: this.title
    });
  }

  loadYears() {
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 1900; year--) {
      this.years.push(year);
    }
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.carForm.controls[controlName].hasError(errorName);
  }

  loadBrands() {
    this.carService.getBrands().subscribe({
      next: (response) => {
        for (let i = 0; i < response.data.length; i++) {
          this.brands.push(response.data[i].name);
        }
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  loadUsers() {
    this.userService.getAll().subscribe({
      next: (response) => {
        this.users = response;
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
      }
    });
  }

  onBrandChange(event: any) {
    const selectedBrand = event.target.value;
    this.models = [];

    this.carService.getModelsByBrand(selectedBrand).subscribe({
      next: (response) => {
        for (let i = 0; i < response.data.length; i++) {
          this.models.push(response.data[i].name);
        }
      },
      error: (error) => {
        console.error('Error al cargar modelos:', error);
      }
    });
  }

  async fillFormWithDefaults() {
    this.carForm.patchValue({
      owner: this.currentUser.username,
      title: 'BMW 320ci E46 2001',
      price: 33000,
      currency: '€',
      brand: 'BMW',
      model: 'E46',
      year: 2001,
      color: 'navy',
      seats: 5,
      doors: 2,
      description: 'El BMW Serie 3 E46 no es solo un coche, es una pieza de la historia automovilística que combina a la perfección rendimiento, lujo y fiabilidad. Diseñado para aquellos que aprecian la conducción pura, este modelo se ha convertido en un favorito tanto para entusiastas como para aquellos que buscan un vehículo premium versátil.',
      location: '-0.376398131838944 39.47331748845821',
      city: 'Valencia',
      gearbox: 'manual',
      fuel: 'gasoline',

      horsepower: 185,
      distance: 100000,
      type: 'sedan',
      emissions: 120,
      consumption: 5.5,
      acceleration: 7.2,
      drive: 'rwd',
    });

    this.images = [];
    this.selectedFiles = [];

    // Add two images to the images array and selectedFiles array
    this.images.push({ imageUrl: 'assets/images/image1.webp', car: this.car, id: 0 });
    this.images.push({ imageUrl: 'assets/images/image2.webp', car: this.car, id: 1 });
    this.imageIndex = this.images.length - 1;

    // Helper function to fetch the image and convert it to a File object
    const imageToFile = async (url, fileName) => {
      const response = await fetch(url);
      const blob = await response.blob();
      return new File([blob], fileName, { type: blob.type });
    };

    // Select the two images as files and add them to the array
    const file1 = await imageToFile('assets/images/image1.webp', 'image1.webp');
    const file2 = await imageToFile('assets/images/image2.webp', 'image2.webp');

    this.selectedFiles.push(file1);
    this.selectedFiles.push(file2);

    // Actualizar el contenido del span
    this.renderer.setProperty(this.descriptionSpan.nativeElement, 'innerHTML', this.carForm.get('description')?.value);

    this.map?.setCenter([-0.376398131838944, 39.47331748845821]);
    this.marker?.setLngLat([-0.376398131838944, 39.47331748845821]);
  }

  getUserInitials(user: IUser): string {
    if (user.name && user.lastname) {
      return `${user.name.charAt(0)}${user.lastname.charAt(0)}`.toUpperCase();
    }
    return '';
  }

  setFormUser(username: string): Observable<FormGroup> {
    if (username === '' || username === null) {
      console.error('Please login');
      this.router.navigate(['/login']);
      return of(this.carForm);
    } else {
      return this.userService.getByUsername(username).pipe(
        switchMap((user: IUser) => {
          this.carForm.patchValue({ owner: user });
          return of(this.carForm);
        })
      );
    }
  }

  onSubmit() {
    if (this.carForm.get('owner')?.value === null) {
      console.error('Please login');
      this.router.navigate(['/login']);
    } else {
      if (this.selectedFiles.length < 2 && this.images.length < 2) {
        // this.toastService.show('Debes subir 2 fotos como minimo');
        console.error('Debes subir 2 fotos como minimo');
      } else {

        if (this.carForm.valid) {
          if (this.operation === 'NEW') {
            this.setFormUser(this.carForm.get('owner')?.value)
              .pipe(
                switchMap(() => this.carService.create(this.carForm.value)),
                switchMap((car: ICar) => {
                  this.car = car;

                  return of(this.uploadImages(this.car));
                })
              )
              .subscribe({
                next: () => {
                  // Aquí puedes redirigir si es necesario
                  this.router.navigate(['/car', this.car]);
                },
                error: (error) => {
                  console.error('Error en el proceso de creación:', error);
                  this.status = error;
                }
              });
          }
        } else {
          console.error('Formulario no válido');

        }
      }
    }
  }

  uploadImages(car: ICar) {
    this.selectedFiles.forEach(file => {
      const formData = new FormData();
      formData.append('file', file);
      this.mediaService.createCarImage(formData, car, undefined).subscribe({
        next: (image) => {
        },
        error: (error) => {
          console.error('Error al subir la imagen:', error);
        }
      });
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

  addFiles(event: any): void {
    const files = event.target.files;

    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (this.checkFileSizeImage(file)) {
          if (this.checkFileType(file)) {
            // add the image to the preview
            this.addImage(file);

          } else {
            //this.toastService.show('El archivo seleccionado no es una imagen.');
            console.error('El archivo seleccionado no es una imagen.');
          }
        } else {
          //this.toastService.show('El archivo seleccionado excede el tamaño máximo permitido.');
          console.error('El archivo seleccionado excede el tamaño máximo permitido.');
        }
      }
    }
  }


  addImage(file: File): void {
    if (this.images.length >= 8) {
      // this.toastService.show('No puedes añadir más de 8 imágenes.');
      console.error('No puedes añadir más de 8 imágenes.');
    } else {
      const image: IImage = {
        imageUrl: URL.createObjectURL(file),
        car: this.car,
        id: this.images.length
      };
      this.images.push(image);
      this.selectedFiles.push(file);

      if (this.images.length === 1) {
        this.imageIndex = 0;
      } else {
        this.imageIndex++;
      }
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

  deleteImage(imageId: number): void {
    // take out the image from the images array
    this.images = this.images.filter(image => image.id !== imageId);
    this.selectedFiles = this.selectedFiles.filter((file, index) => index !== imageId);

    if (this.images.length === 0) {
      this.imageIndex = 0;
    } else {
      this.imageIndex = this.images.length - 1;
    }
  }
}
