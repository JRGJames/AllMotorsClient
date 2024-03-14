import { Component, OnInit, OnDestroy } from '@angular/core';
import { CarService } from 'src/app/service/car.service';
import { ICar } from 'src/app/model/model';
import { API_URL } from 'src/environment/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit, OnDestroy {
  url = API_URL;
  popularCars: ICar[] = [];
  currentPage: number = 0;
  autoChangePage: any;

  constructor(
    private carService: CarService,
  ) { }

  ngOnInit() {
    this.loadPopularCars();
    this.startAutoChangePage();
  }

  ngOnDestroy() {
    if (this.autoChangePage) {
      clearInterval(this.autoChangePage);
    }
  }

  loadPopularCars() {
    const amount = 5;
    this.carService.byViews(amount).subscribe({
      next: (data: ICar[]) => {
        this.popularCars = data;
        console.log(this.popularCars);
      },
      error: (error) => {
        console.error('Error al cargar coches populares:', error);
      }
    });
  }

  startAutoChangePage() {
    this.autoChangePage = setInterval(() => {
      this.nextPage();
    }, 15000);
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    } else {
      this.currentPage = this.popularCars.length;
    }
    this.resetAutoChangePage();
  }

  nextPage() {
    if (this.currentPage < this.popularCars.length) {
      this.currentPage++;
    } else {
      this.currentPage = 1;
    }
    this.resetAutoChangePage();
  }

  resetAutoChangePage() {
    if (this.autoChangePage) {
      clearInterval(this.autoChangePage);
    }
    this.startAutoChangePage();
  }

  changePage(newPage: number) {
    this.currentPage = newPage;
    this.resetAutoChangePage();
  }
}
