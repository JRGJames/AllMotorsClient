import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IBrand, ICar, IImage, IModel, IUser, formOperation } from 'src/app/model/model';
import { CarService } from '../../../../../service/car.service';
import { UserService } from '../../../../../service/user.service';
import { SessionService } from '../../../../../service/session.service';
import { Router } from '@angular/router';
import { MediaService } from 'src/app/service/media.service';


@Component({
  selector: 'app-car-form',
  templateUrl: './car-form.component.html',
  styleUrls: ['./car-form.component.css']
})
export class CarFormComponent implements OnInit {

  @Input() id: number = 1;
  @Input() operation: formOperation = 'NEW'; // new or edit

  selectedFiles: File[] = []; // Este array solo contendrá objetos File
  images: IImage[] = [];
  carForm!: FormGroup;
  car: ICar = { owner: { id: 0 } } as ICar;
  status: HttpErrorResponse | null = null;
  user: IUser = {} as IUser;
  title: string = '';
  years: number[] = [];
  brands: string[] = [];
  models: string[] = [];
  backgroundImage: string = `url(assets/images/image1.jpg)`;

  constructor(
    private formBuilder: FormBuilder,
    private carService: CarService,
    private userService: UserService,
    private sessionService: SessionService,
    private mediaService: MediaService,
    private router: Router
  ) {
    this.initializeForm(this.car);
  }

  initializeForm(car: ICar) {
    this.carForm = this.formBuilder.group({
      brand: [car.brand, [Validators.required, Validators.minLength(2)]],
      model: [car.model, [Validators.required, Validators.minLength(2)]],
      title: [car.title, [Validators.required, Validators.minLength(3)]],
      images: [car.images], // La validación de archivos puede requerir un enfoque personalizado
      color: [car.color, [Validators.required]],
      year: [car.year, [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear())]],
      seats: [car.seats, [Validators.required, Validators.min(1), Validators.max(9)]],
      doors: [car.doors, [Validators.required, Validators.min(1), Validators.max(20)]],
      horsepower: [car.horsepower, [Validators.min(10)]],
      gearbox: [car.gearbox, [Validators.required]],
      distance: [car.distance, [Validators.required, Validators.min(0)]],
      fuel: [car.fuel, [Validators.required]],
      price: [car.price, [Validators.required, Validators.min(1)]],
      type: [car.type, [Validators.required]],
      location: [car.location, [Validators.required]],
      boughtIn: [car.boughtIn],
      currency: [car.currency, [Validators.required]],
      emissions: [car.emissions, [Validators.min(0)]],
      consumption: [car.consumption, [Validators.min(0)]],
      acceleration: [car.acceleration, [Validators.min(0)]],
      engine: [car.engine],
      drive: [car.drive],
      plate: [car.plate],
      dgtSticker: [car.dgtSticker],
      lastITV: [car.lastITV],
      description: [car.description],
      owner: this.formBuilder.group({
        id: [car.owner.id, [Validators.required]]
      })
    });
  }

  ngOnInit() {
    this.initializeForm(this.car); // No incluye el campo 'id'
    this.loadYears();
    this.loadBrands();
    this.userService.getByUsername(this.sessionService.getUsername()).subscribe({
      next: (data: IUser) => {
        this.user = data;
        this.carForm.get('owner')?.setValue({ id: this.user.id });
      },
      error: (error: HttpErrorResponse) => {
        this.status = error;
      }
    });
  }

  changeTitleBrand(event: any) {
    this.title = event.target.value;
  }

  changeTitleModel(event: any) {
    this.title += ' ' + event.target.value;
  }

  setGearbox(gearboxType: string) {
    this.carForm.patchValue({
      gearbox: gearboxType
    });
  }

  setFuel(fuelType: string) {
    this.carForm.patchValue({
      fuel: fuelType
    });
  }

  handleFileInput(event: any) {
    const files: FileList = event.target.files;

    // Llenamos selectedFiles con objetos File
    this.selectedFiles = Array.from(files);

    // Creamos el array de IImage basado en los archivos seleccionados
    this.images = this.selectedFiles.map(file => ({
      imageUrl: file.name, // Usamos el nombre del archivo para imageUrl
      car: this.car // Ponemos el valor de car como null
    }));

    console.log('Imagenes seleccionadas:', this.selectedFiles);
    console.log('Imagenes para IImage:', this.images);
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
        console.log('Marcas:', response);
        for (let i = 0; i < response.data.length; i++) {
          this.brands.push(response.data[i].name);
        }
      },
      error: (error) => {
        console.error(error);
      }
    });
    console.log('Marcas:', this.brands);
  }

  onBrandChange(event: any) {
    const selectedBrand = event.target.value;
    this.carService.getModelsByBrand(selectedBrand).subscribe({
      next: (response) => {
        // Ajusta esto según la estructura de tu respuesta
        this.models.push(response.data); // o simplemente response si la API devuelve directamente un array
        console.log('Modelos:', this.models);
      },
      error: (error) => {
        console.error('Error al cargar modelos:', error);
      }
    });
  }

  fillFormWithDefaults() {
    this.carForm.patchValue({
      brand: 'BMW',
      model: 'e39',
      year: '1930',
      gearbox: 'manual',
      color: 'red',
      seats: 5,
      doors: 4,
      horsepower: 200,
      distance: 50000,
      fuel: 'petrol',
      price: 30000,
      type: 'sedan',
      location: 'City',
      title: 'Excellent Condition',
      boughtIn: 'Germany',
      currency: '€',
      emissions: 120,
      consumption: 5.5,
      acceleration: 7.2,
      engine: '3.0L V6',
      drive: 'rwd',
      plate: 'ABC123',
      dgtSticker: 'C',
      lastITV: new Date(),
      description: 'Detailed description of the car.',
      owner: { id: this.user.id }
    });
  }


  onSubmit() {
    if (this.carForm.valid) {
      // Convertir datos del formulario a JSON para incluirlos en FormData
      const formData = new FormData();

      if (this.operation === 'NEW') {
        this.carService.create(this.carForm.value).subscribe({
          next: (car: ICar) => {
            console.log('Coche creado:', car);

            if (this.images && this.images.length > 2) {
              // Array.from(this.images).forEach((image) => {
              //   formData.append('images', image.imageUrl, car.id.toString());
              // });

              this.mediaService.uploadMultipleFiles(formData).subscribe({
                next: (response) => {
                  console.log('Imágenes subidas:', response);
                  this.router.navigate(['/car', car.id]);
                },
                error: (uploadError) => {
                  console.error('Error subiendo imágenes:', uploadError);
                  this.status = uploadError;
                }
              });
            } else {
              this.router.navigate(['/car', car]);
            }
          },
          error: (createError) => {
            console.error('Error creando el coche:', createError);
            this.status = createError;
          }
        });
      }
    }
  }
}
