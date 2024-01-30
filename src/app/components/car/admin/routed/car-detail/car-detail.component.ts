import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit, Optional } from '@angular/core';
import { ICar } from 'src/app/model/model';
import { CarService } from 'src/app/service/car.service';

@Component({
  selector: 'app-car-detail',
  templateUrl: './car-detail.component.html',
  styleUrls: ['./car-detail.component.css'],
})
export class CarDetailComponent implements OnInit {
  @Input() id: number = 1;

  car: ICar = { owner: {} } as ICar;
  status: HttpErrorResponse | null = null;

  constructor(
    private carService:CarService,
  ) {
  }

  ngOnInit() {
    this.getOne();
  }

  getOne(): void {
    this.carService.get(this.id).subscribe({
      next: (data: ICar) => {
        this.car = data;
      },
      error: (error: HttpErrorResponse) => {
        this.status = error;
      }

    })

  }
}
