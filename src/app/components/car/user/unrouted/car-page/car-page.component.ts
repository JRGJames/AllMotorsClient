import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ICar, ICarPage } from 'src/app/model/model';
import { CarService } from 'src/app/service/car.service';
import { SessionService } from 'src/app/service/session.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-car-page',
  templateUrl: './car-page.component.html',
  styleUrls: ['./car-page.component.css']
})
export class CarPageComponent implements OnInit {
  cars: ICar[] = [];
  currentPage: number = 0;
  totalPageCount: number = 0;
  pageSize: number = 15; // O el tamaño de página que prefieras
  status: HttpErrorResponse | null = null;

  constructor(
    private carService: CarService,
    private sessionService: SessionService,
    private router: Router // inyectar Router
  ) { }

  ngOnInit() {
    this.getPage(this.currentPage);
  }

  getPage(pageNumber: number): void {
    const orderField = 'id'; // O cualquier campo que quieras ordenar
    const orderDirection = 'asc'; // 'asc' o 'desc'
    const id_user = 0; // O el ID de usuario que desees filtrar
    const filter = ''; // O el filtro que desees aplicar

    this.carService.getPage(this.pageSize, pageNumber, orderField, orderDirection, id_user, filter).subscribe({
      next: (data: ICarPage) => {
        this.cars = data.content;
        this.totalPageCount = data.totalPages;
        this.currentPage = pageNumber;
      },
      error: (error: HttpErrorResponse) => {
        this.status = error;
      }
    });
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
