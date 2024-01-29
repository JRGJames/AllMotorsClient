import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ICar, IUser, formOperation } from 'src/app/model/model';
import { CarService } from '../../../../../service/car.service';
import { UserService } from '../../../../../service/user.service';
import { SessionService } from '../../../../../service/session.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-car-form',
  templateUrl: './car-form.component.html',
  styleUrls: ['./car-form.component.css']
})
export class CarFormComponent implements OnInit {

  @Input() id: number = 1;
  @Input() operation: formOperation = 'NEW'; // new or edit

  carForm!: FormGroup;
  car: ICar = { owner: { id: 0 } } as ICar;
  status: HttpErrorResponse | null = null;
  user: IUser = {} as IUser;

  constructor(
    private formBuilder: FormBuilder,
    private carService: CarService,
    private userService: UserService,
    private sessionService: SessionService,
    private router: Router

  ) {
    this.initializeForm(this.car);
  }

  initializeForm(car: ICar) {
    this.carForm = this.formBuilder.group({
      brand: [car.brand, Validators.required],
      model: [car.model, Validators.required],
      // images: [car.images, Validators.required],
      color: [car.color, Validators.required],
      year: [car.year, Validators.required],
      seats: [car.seats, Validators.required],
      doors: [car.doors, Validators.required],
      horsepower: [car.horsepower, Validators.required],
      transmission: [car.transmission, Validators.required],
      distance: [car.distance, Validators.required],
      engine: [car.engine, Validators.required],
      price: [car.price, Validators.required],
      type: [car.type, Validators.required],
      location: [car.location, Validators.required],
      emissions: [car.emissions],
      consumption: [car.consumption],
      plate: [car.plate],
      dgtSticker: [car.dgtSticker],
      lastItv: [car.lastItv],
      description: [car.description],
      owner: this.formBuilder.group({
        id: [car.owner.id, Validators.required]
      })
    });
  }

  ngOnInit() {
    if (this.operation == 'EDIT') {
      this.carService.get(this.id).subscribe({
        next: (data: ICar) => {
          this.car = data;
          this.initializeForm(this.car);
        },
        error: (error: HttpErrorResponse) => {
          this.status = error;
        }
      })
    } else {
      // Obtener el usuario actual al inicializar si es una nueva creación
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

  public hasError = (controlName: string, errorName: string) => {
    return this.carForm.controls[controlName].hasError(errorName);
  }

  onSubmit() {
    if (this.carForm.valid) {
      if (this.operation === 'NEW') {
        this.carService.create(this.carForm.value).subscribe({
          next: (data: ICar) => {
            this.car = { owner: this.user } as ICar;
            this.initializeForm(this.car);
            this.router.navigate(['/car', data.id]);
          },
          error: (error: HttpErrorResponse) => {
            this.status = error;
          }
        });
      } else {
        this.carService.update(this.carForm.value).subscribe({
          next: (data: ICar) => {
            this.car = data;
            this.initializeForm(this.car);
            this.router.navigate(['/car', data.id]);
          },
          error: (error: HttpErrorResponse) => {
            this.status = error;
          }
        });
      }
    }
  }
}