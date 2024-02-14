import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ICar, IUser, formOperation } from 'src/app/model/model';
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

  selectedFiles: FileList | null = null;
  carForm!: FormGroup;
  car: ICar = { owner: { id: 0 } } as ICar;
  status: HttpErrorResponse | null = null;
  user: IUser = {} as IUser;

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
      brand: [car.brand, Validators.required],
      model: [car.model, Validators.required],
      title: [car.title, Validators.required],
      images: [car.images, Validators.required],
      color: [car.color, Validators.required],
      year: [car.year, Validators.required],
      seats: [car.seats, Validators.required],
      doors: [car.doors, Validators.required],
      horsepower: [car.horsepower, Validators.required],
      gearbox: [car.gearbox, Validators.required],
      distance: [car.distance, Validators.required],
      fuel: [car.fuel, Validators.required],
      price: [car.price, Validators.required],
      type: [car.type, Validators.required],
      location: [car.location, Validators.required],
      boughtIn: [car.boughtIn, Validators.required],
      currency: [car.currency, Validators.required],
      emissions: [car.emissions],
      consumption: [car.consumption],
      acceleration: [car.acceleration],
      engine: [car.engine],
      drive: [car.drive],
      plate: [car.plate],
      dgtSticker: [car.dgtSticker],
      lastITV: [car.lastITV],
      description: [car.description],
      owner: this.formBuilder.group({
        id: [car.owner.id, Validators.required]
      })
    });


  }

  ngOnInit() {
    if (this.operation === 'EDIT' && this.id) {
      this.carService.get(this.id).subscribe({
        next: (data: ICar) => {
          this.car = data;
          this.initializeForm(this.car); // Incluye el campo 'id' para la operación 'EDIT'
        },
        error: (error: HttpErrorResponse) => {
          this.status = error;
        }
      });
    } else {
      // En el caso de la creación de un nuevo coche ('NEW'), inicializa el formulario sin 'id'
      this.initializeForm(this.car); // No incluye el campo 'id'
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
  }

  handleFileInput(event: any) {
    this.selectedFiles = event.target.files;
    console.log('Imagenes seleccionadas:', this.selectedFiles);
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.carForm.controls[controlName].hasError(errorName);
  }

  fillFormWithDefaults() {
    this.carForm.patchValue({
      brand: 'Mercedes',
      model: 'e39',
      year: 2002,
      gearbox: 'Manual',
      color: 'Red',
      seats: 5,
      doors: 4,
      horsepower: 200,
      distance: 50000,
      fuel: 'Petrol',
      price: 30000,
      type: 'Sedan',
      location: 'City',
      title: 'Excellent Condition',
      boughtIn: 'Germany',
      currency: '€',
      emissions: 120,
      consumption: 5.5,
      acceleration: 7.2,
      engine: '3.0L V6',
      drive: 'RWD',
      plate: 'ABC123',
      dgtSticker: 'C',
      lastITV: '2021-06-01',
      description: 'Detailed description of the car.',
      owner: { id: this.user.id }
    });
  }


  onSubmit() {
    if (this.carForm.valid && this.selectedFiles) {
      console.log('Formulario:', this.carForm.value);

      const formData = new FormData();

      Array.from(this.selectedFiles).forEach((file) => {
        this.carForm.setValue({ images: file });
      });

      formData.append('car', JSON.stringify(this.carForm.value));
      // Primero, crea el coche y luego sube las imágenes
      this.carService.create(this.carForm.value).subscribe({
        next: (car: ICar) => {
          if (this.selectedFiles && this.selectedFiles.length > 0) {
            // Sube las imágenes solo si se seleccionaron
            this.mediaService.uploadMultipleFiles(formData).subscribe({
              next: (response) => {
                console.log('Imagenes subidas:', response);
                // Navega a la página del coche recién creado o actualiza la UI según sea necesario
                this.router.navigate(['/car', car.id]);
              },
              error: (error: HttpErrorResponse) => {
                console.error('Error subiendo imagenes:', error);
                this.status = error;
              }
            });
          } else {
            // Si no se seleccionaron imágenes, navega directamente
            this.router.navigate(['/car', car.id]);
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error creando el coche:', error);
          this.status = error;
        }
      });
    }
  }

}
