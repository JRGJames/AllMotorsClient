import { Component, OnInit, OnDestroy } from '@angular/core';
import { CarService } from 'src/app/service/car.service';
import { ICar } from 'src/app/model/model';
import { API_URL_MEDIA } from 'src/environment/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})

export class HomeComponent implements OnInit, OnDestroy {
  urlImage = API_URL_MEDIA;
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
          button.setAttribute('disabled', 'true');
        });

        setTimeout(() => {
          slider.style.transition = 'all 0.5s';
          buttons.forEach((button) => {
            button.removeAttribute('disabled');
          });
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
      },
      error: (error) => {
        console.error('Error al cargar coches populares:', error);
      }
    });
  }

  startAutoChangePage() {
    this.autoChangePage = setInterval(() => {
      this.nextPage();
      console.log('Cambiando de página automáticamente');
    }, 15000);
  }

  prevPage() {
    const slider = document.getElementById('slider');
    const carousel = document.getElementById('carousel');
    const buttons = document.querySelectorAll('.buttons');

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

    buttons.forEach((button) => {
      button.setAttribute('disabled', 'true');
    });

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
    const buttons = document.querySelectorAll('.buttons');

    this.direction = -1;

    if (slider) {
      slider.style.transform = 'translateX(-20%)';
      slider.style.transition = 'all 0.5s';
    }
    if (carousel) {
      carousel.style.justifyContent = 'flex-start';
    }

    buttons.forEach((button) => {
      button.setAttribute('disabled', 'true');
    });

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

  resetBehavior(): void {
    document.scrollingElement?.scrollTo({ top: 0, behavior: 'auto' });
    document.body.classList.remove('overflow-hidden');
  }

}  
