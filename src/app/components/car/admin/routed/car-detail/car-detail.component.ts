import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ICar, IImage } from 'src/app/model/model';
import { CarService } from 'src/app/service/car.service';
import { SessionService } from 'src/app/service/session.service';

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
    private sessionService: SessionService,
    private route: ActivatedRoute,
    private router: Router

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

  handleBookmarkClick(car: ICar): void {
    if (!this.sessionService.isSessionActive()) {
      // Si el usuario no ha iniciado sesión, redirige a la página de inicio de sesión.
      this.router.navigate(['/login']);
    } else {
      // Aquí puedes implementar la lógica para manejar la acción de favorito.
      console.log('Añadir a favoritos:', car);
    }
  }
}
