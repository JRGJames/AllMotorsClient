import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ICar } from 'src/app/model/model';
import { CarService } from 'src/app/service/car.service';

@Component({
  selector: 'app-car-detail',
  templateUrl: './car-detail.component.html',
  styleUrls: ['./car-detail.component.css'],
})
export class CarDetailComponent implements OnInit {
  showPhoneNumber: boolean = false;
  id!: number;

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
        this.car = data;
      },
      error: (error: HttpErrorResponse) => {
        this.status = error;
      }
    });
  }

  togglePhoneNumber(): void {
    this.showPhoneNumber = !this.showPhoneNumber;
  }
}
