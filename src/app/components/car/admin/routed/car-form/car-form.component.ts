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


  public hasError = (controlName: string, errorName: string) => {
    return this.carForm.controls[controlName].hasError(errorName);
  }

  onSubmit() {
    if (this.carForm.valid) {
      if (this.operation === 'NEW') {
        this.carService.create(this.carForm.value).subscribe({
          next: (data: ICar) => {
            console.log(data.id);
            this.car = { owner: this.user } as ICar;
            this.initializeForm(this.car);
            // this.mediaService.uploadMultipleFiles()
            this.router.navigate(['/car/', data.id]);
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
            this.router.navigate(['/car/', data.id]);
          },
          error: (error: HttpErrorResponse) => {
            this.status = error;
          }
        });
      }
    }
  }

  upload(event: any) {
    const MAX_FILES = 8;
    const files: FileList = event.target.files;
    const formData = new FormData();

    if (files && files.length > 0) {

      if (files.length > MAX_FILES) {
        console.error('You can only upload a maximum of ' + MAX_FILES + ' files.');
        // Aquí puedes mostrar un mensaje al usuario si lo deseas
        return;
      }

      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }

    }
    return formData;
  }


}
