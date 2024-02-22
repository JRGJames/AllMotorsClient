import { Component, OnInit} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ICar, ICarPage, IUser } from 'src/app/model/model';
import { CarService } from 'src/app/service/car.service';
import { SessionService } from 'src/app/service/session.service';
import { Router } from '@angular/router';
import { UserService } from 'src/app/service/user.service';
import { API_URL } from 'src/environment/environment';

@Component({
  selector: 'app-car-page',
  templateUrl: './car-page.component.html',
  styleUrls: ['./car-page.component.css']
})
export class CarPageComponent implements OnInit {
  url = API_URL;
  searchFilter: string = '';
  carsSearch: ICarPage | undefined;
  cars: ICar[] = [];
  currentPage: number = 0;
  totalPageCount: number = 0;
  totalElements: number = 0;  // Total de elementos (coches)
  pageSize: number = 15; // O el tamaño de página que prefieras
  status: HttpErrorResponse | null = null;
  currentUser: IUser = {} as IUser;
  car: ICar = { owner: {} } as ICar; // Objeto para almacenar la información del coche
  isViewModalVisible: boolean = false;
  selectedCar: ICar | null = null; // Car seleccionado para mostrar en el modal

  isOpen = false; // Controla el estado del dropdown

  constructor(
    private carService: CarService,
    private sessionService: SessionService,
    private userService: UserService,
    private router: Router // inyectar Router
  ) { }

  ngOnInit() {
    this.loadCars();
    this.getCurrentUser();
  }

  loadCars(): void {
    this.carService.getPage(this.pageSize, this.currentPage, 'id', 'asc', 0, this.searchFilter).subscribe({
      next: (data) => {
        this.cars = data.content; // Asume que ICarPage tiene una propiedad content con los coches
        this.totalPageCount = data.totalPages;
        this.totalElements = data.totalElements;
        this.currentPage = 0;
        // Actualiza la UI según sea necesario aquí
      },
      error: (error) => {
        console.error('Error fetching cars:', error);
      }
    });
  }
  

  onSearch(): void {
    this.loadCars();
  }

  openViewModal(event: MouseEvent, car: ICar): void {
    event.stopPropagation(); // Detiene la propagación del evento
    this.selectedCar = car; // Establece el coche seleccionado
    this.isViewModalVisible = true; // Muestra el modal
  }  

  closeViewModal(): void {
    this.isViewModalVisible = false;
    this.selectedCar = null; // Limpia el coche seleccionado
  }

  navigateToCar(carId: number): void {
    this.router.navigate(['/car', carId]);
  }

  getCurrentUser(): void {
    if (this.sessionService.isSessionActive()) {
      const username = this.sessionService.getUsername();
      this.userService.getByUsername(username).subscribe({
        next: (user: IUser) => {
          this.currentUser = user;
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error al cargar los datos del usuario actual:', error);
        }
      });
    }
  }

  isCurrentUserAdmin(): boolean {
    return this.currentUser.role === true;
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

  pupulate(qty: number) {
    this.carService.generateRandom(qty).subscribe({
      next: (data: number) => {
        console.log('Se han generado', data, 'coches');
        this.getPage(this.currentPage);
      },
      error: (error: HttpErrorResponse) => {
        this.status = error;
      }
    });
  }

  empty() {
    this.carService.empty().subscribe({
      next: (data: number) => {
        console.log('Se han eliminado', data, 'coches');
        this.getPage(0);
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
}
