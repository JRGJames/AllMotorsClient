import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ICar, IImage } from 'src/app/model/model';
import { CarService } from 'src/app/service/car.service';

@Component({
  selector: 'app-car-detail',
  templateUrl: './car-detail.component.html',
  styleUrls: ['./car-detail.component.css'],
})
export class CarDetailComponent implements OnInit {
  showPhoneNumber: boolean = false;
  id!: number;
  imageIndex = 0; // Índice de la imagen actual en el carrusel
  images: IImage[] = [];

  car: ICar = { owner: {} } as ICar;
  status: HttpErrorResponse | null = null;

  constructor(
    private carService: CarService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.id = +params['id'];
      this.getOne();
    });
  }

  getOne(): void {
    this.carService.get(this.id).subscribe({
      next: (data: ICar) => {
        console.log(this.car.lastITV);
        this.car = data;
      },
      error: (error: HttpErrorResponse) => {
        this.status = error;
      }
    });
  }

  // Navegar a la imagen anterior
  prevImage() {
    if (this.imageIndex > 0) {
      this.imageIndex--;
    }
  }

  // Navegar a la imagen siguiente
  nextImage() {
    if (this.imageIndex < this.car.images.length - 1) {
      this.imageIndex++;
    }
  }

  changePage(newPage: number) {
    this.imageIndex = newPage;
  }

  togglePhoneNumber(): void {
    this.showPhoneNumber = !this.showPhoneNumber;
  }
}
