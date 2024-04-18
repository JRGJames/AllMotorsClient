import { Component, OnInit, OnDestroy } from '@angular/core';
import { CarService } from 'src/app/service/car.service';
import { ICar } from 'src/app/model/model';
import { API_URL } from 'src/environment/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})

export class HomeComponent implements OnInit, OnDestroy {
  url = API_URL;
  popularCars: ICar[] = [];
  currentPage: number = 1;
  autoChangePage: any;
  direction: number = 0;

  constructor(
    private carService: CarService,
  ) { }

  ngOnInit() {
    this.loadPopularCars();
    this.startAutoChangePage();
    this.eventListener();
  }

  eventListener() {
    const slider = document.getElementById('slider');
    const buttons = document.querySelectorAll('.buttons');

    if (slider) { 
      slider.addEventListener('transitionend', () => {
        if (this.direction === -1) {
          slider.appendChild(slider.firstElementChild as HTMLElement);
        } else if (this.direction === 1) {
          slider.prepend(slider.lastElementChild as HTMLElement);
        }

        slider.style.transition = 'none';
        slider.style.transform = 'translateX(0)';
        buttons.forEach((button) => {

        });

        setTimeout(() => {
          slider.style.transition = 'all 0.5s';
        });
      });
    }
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
    const slider = document.getElementById('slider');
    const carousel = document.getElementById('carousel');
    
    if (slider) {
      if (this.direction === -1) {
        slider.appendChild(slider.firstElementChild as HTMLElement);
        this.direction = 1;
      }
      this.direction = 1;
      slider.style.transform = 'translateX(20%)';
      slider.style.transition = 'all 0.5s';
      
    }
    if (carousel) {
      carousel.style.justifyContent = 'flex-end';
    }

    if (this.currentPage > 1) {
      this.currentPage--;
    } else {
      this.currentPage = this.popularCars.length;
    }

    this.resetAutoChangePage();
  }

  nextPage() {
    const slider = document.getElementById('slider');
    const carousel = document.getElementById('carousel');
    this.direction = -1;

    if (slider) {
      slider.style.transform = 'translateX(-20%)';
      slider.style.transition = 'all 0.5s';
    }
    if (carousel) {
      carousel.style.justifyContent = 'flex-start';
    }

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
