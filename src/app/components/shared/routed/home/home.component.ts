import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ICar } from 'src/app/model/model';
import { CarService } from 'src/app/service/car.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  @Input() images: string[] = [];
  currentPage: number = 1;

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

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.images.length) {
      this.currentPage++;
    }
  }

  showPhoneNumber: boolean = false;
  id!: number;

  car: ICar = { owner: {} } as ICar;
  status: HttpErrorResponse | null = null;

  

  

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
}