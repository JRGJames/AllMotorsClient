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

  selectedFiles?: FileList;
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

  initializeForm(car: ICar, includeId: boolean = false) {
    this.carForm = this.formBuilder.group({
      brand: [car.brand, Validators.required],
      model: [car.model, Validators.required],
      title: [car.title, Validators.required],
      images: [car.images],
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
      boughtIn: [car.boughtIn],
      currency: [car.currency],
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
          this.initializeForm(this.car, true); // Incluye el campo 'id' para la operación 'EDIT'
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
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.carForm.controls[controlName].hasError(errorName);
  }

  onSubmit() {
    if (this.carForm.valid) {
      if (this.operation === 'NEW') {
        // Elimina la línea que intenta manipular las imágenes desde formData, ya que eso se manejará por separado
        console.log(this.carForm.value);
        this.carService.create(this.carForm.value).subscribe({
          next: (car: ICar) => {
            console.log(car);
            
              // Asume que tu servicio espera el ID del coche como parte del FormData o como un parámetro aparte
              // Aquí simplemente lo pasamos como parte del FormData para el ejemplo

              this.router.navigate(['/car/', car]);
            
          },
          error: (error: HttpErrorResponse) => {
            console.error(error);
            this.status = error;
          }
        });
      } else {
        // Manejo para la operación 'EDIT'
      }
    }
  }
}
