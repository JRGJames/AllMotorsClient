// En HomeComponent
import { Component, OnInit } from '@angular/core';
import { CarService } from 'src/app/service/car.service';
import { ICar } from 'src/app/model/model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  popularCars: ICar[] = [];
  currentPage: number = 1;

  constructor(private carService: CarService) {}

  ngOnInit() {
    this.loadPopularCars();
  }

  loadPopularCars() {
    const amount = 5; // Cantidad de coches más visitados que deseas mostrar
    this.carService.byViews(amount).subscribe(
      (data: ICar[]) => {
        this.popularCars = data;
      },
      (error) => {
        console.error('Error al cargar coches populares:', error);
      }
    );
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.popularCars.length) {
      this.currentPage++;
    }
  }
}
