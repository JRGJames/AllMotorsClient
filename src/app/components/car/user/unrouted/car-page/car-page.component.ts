import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
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
  totalElements: number = 0;  // Total de elementos (coches)
  pageSize: number = 15; // O el tamaño de página que prefieras
  status: HttpErrorResponse | null = null;

  @ViewChild('dropdownMenu') dropdownMenu!: ElementRef;

  isOpen = false; // Controla el estado del dropdown

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
        this.totalElements = data.totalElements; // Asegúrate de que esta propiedad está disponible
        this.currentPage = pageNumber;
      },
      error: (error: HttpErrorResponse) => {
        this.status = error;
      }
    });
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.getPage(this.currentPage - 1);
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPageCount) {
      this.getPage(this.currentPage + 1);
    }
  }

  changePage(pageNumber: number) {
    this.getPage(pageNumber);
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

  togglePageSize(pageSize: number) {
    this.pageSize = pageSize;
    this.getPage(0);
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
    this.dropdownMenu.nativeElement.classList.toggle('hidden', !this.isOpen);
  }
}
