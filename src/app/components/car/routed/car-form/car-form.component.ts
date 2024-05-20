import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IBrand, ICar, IImage, IModel, IUser, formOperation } from 'src/app/model/model';
import { CarService } from '../../../../service/car.service';
import { UserService } from '../../../../service/user.service';
import { SessionService } from '../../../../service/session.service';
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
  years: string[] = [];
  brands: string[] = [
    'Audi', 'BMW', 'Chevrolet', 'Citroen', 'Fiat', 'Ford', 'Honda', 'Hyundai', 'Kia', 'Mazda', 'Mercedes-Benz', 'Nissan', 'Opel', 'Peugeot', 'Renault', 'Seat', 'Skoda', 'Toyota', 'Volkswagen', 'Volvo'
  ];
  models: string[] = [
    'E46', 'E90', 'E92', 'F30', 'F32', 'F80', 'F82', 'F87', 'G20', 'G22', 'G80', 'G82', 'G87', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q3', 'Q5', 'Q7', 'Q8', 'TT', 'R8', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'RS3', 'RS4', 'RS5', 'RS6', 'RS7', 'RSQ3', 'RSQ8', 'RSQ5', 'RSQ7'
  ];
  gearboxTypes: string[] = ['manual', 'automatic'];
  fuelTypes: string[] = ['gasoline', 'diesel', 'electric', 'hybrid'];
  currencies: string[] = ['€', '$', '£', '¥', '₽'];

  backgroundImage: string = `url(assets/images/image1.webp)`;
  showBrands: boolean = false;
  showModels: boolean = false;

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
      brand: [car.brand, [Validators.required]],
      model: [car.model, [Validators.required]],
      title: [car.title, [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
      images: [car.images], // La validación de archivos puede requerir un enfoque personalizado
      color: [car.color, [Validators.required]],
      year: [car.year, [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear())]],
      seats: [car.seats, [Validators.required, Validators.min(1), Validators.max(8)]],
      doors: [car.doors, [Validators.required, Validators.min(1), Validators.max(5)]],
      horsepower: [car.horsepower, [Validators.min(10)]],
      gearbox: [car.gearbox, [Validators.required]],
      distance: [car.distance, [Validators.required]],
      fuel: [car.fuel, [Validators.required]],
      price: [car.price, [Validators.required, Validators.min(1)]],
      type: [car.type],
      location: [car.location, [Validators.required]],
      currency: [car.currency, [Validators.required]],
      emissions: [car.emissions, [Validators.min(0)]],
      consumption: [car.consumption, [Validators.min(0)]],
      acceleration: [car.acceleration, [Validators.min(0)]],
      drive: [car.drive],
      description: [car.description],
      owner: [car.owner.id, [Validators.required]],
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
    // this.images = this.selectedFiles.map(file => ({
    //   imageUrl: file.name, // Usamos el nombre del archivo para imageUrl
    //   car: this.car // Ponemos el valor de car como null
    // }));

    console.log('Imagenes seleccionadas:', this.selectedFiles);
    console.log('Imagenes para IImage:', this.images);
  }

  loadYears() {
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 1900; year--) {
      this.years.push(year.toString());
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

  fillFormWithDefaults() {
    this.carForm.patchValue({
      year: '2001',
      gearbox: 'manual',
      color: 'blue',
      seats: 5,
      doors: 2,
      horsepower: 185,
      distance: 100000,
      fuel: 'gasoline',
      price: 33000,
      type: 'sedan',
      location: 'Valencia',
      title: 'BMW 320ci E46 2001',
      boughtIn: 'Spain',
      currency: '€',
      emissions: 120,
      consumption: 5.5,
      acceleration: 7.2,
      drive: 'rwd',
      plate: 'ABC123',
      dgtSticker: 'C',
      lastITV: new Date(),
      description: 'El BMW Serie 3 E46 no es solo un coche, es una pieza de la historia automovilística que combina a la perfección rendimiento, lujo y fiabilidad. Diseñado para aquellos que aprecian la conducción pura, este modelo se ha convertido en un favorito tanto para entusiastas como para aquellos que buscan un vehículo premium versátil.',
      owner: { id: this.user.id }
    });
  }


  // onSubmit() {
  //   console.log('Formulario:', this.carForm.value);
  //   if (this.carForm.valid) {
  //     // Convertir datos del formulario a JSON para incluirlos en FormData
  //     const formData = new FormData();

  //     if (this.operation === 'NEW') {
  //       this.carService.create(this.carForm.value).subscribe({
  //         next: (car: ICar) => {
  //           console.log('Coche creado:', car);

  //           if (this.images && this.images.length > 2) {
  //             // Array.from(this.images).forEach((image) => {
  //             //   formData.append('images', image.imageUrl, car.id.toString());
  //             // });

  //             this.mediaService.uploadMultipleFiles(formData).subscribe({
  //               next: (response) => {
  //                 console.log('Imágenes subidas:', response);
  //                 this.router.navigate(['/car', car.id]);
  //               },
  //               error: (uploadError) => {
  //                 console.error('Error subiendo imágenes:', uploadError);
  //                 this.status = uploadError;
  //               }
  //             });
  //           } else {
  //             this.router.navigate(['/car', car]);
  //           }
  //         },
  //         error: (createError) => {
  //           console.error('Error creando el coche:', createError);
  //           this.status = createError;
  //         }
  //       });
  //     }
  //   }
  // }
}
