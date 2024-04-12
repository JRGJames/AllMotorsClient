import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ICar, ICarPage, IRating, IUser } from 'src/app/model/model';
import { CarService } from 'src/app/service/car.service';
import { SessionService } from 'src/app/service/session.service';
import { Router } from '@angular/router';
import { UserService } from 'src/app/service/user.service';
import { API_URL } from 'src/environment/environment';
import { RatingService } from 'src/app/service/rating.service';
import { SavedService } from 'src/app/service/saved.service';
import { query } from '@angular/animations';


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
  currentUser: IUser = {} as IUser; // Objeto para almacenar la información del usuario actual;
  car: ICar = { owner: {} } as ICar; // Objeto para almacenar la información del coche
  isViewModalVisible: boolean = false;
  selectedCar: ICar = {} as ICar // Car seleccionado para mostrar en el modal
  isExpanded: { [key: number]: boolean } = {};
  imageIndex: number = 0;
  averageRating: number = 0;
  ratingCount: number = 0;
  fullStars: number[] = [];
  halfStar: boolean = false;
  selectedButtonIndex: number = 0;
  isScreenSmall: boolean = window.innerWidth < 640;

  constructor(
    private carService: CarService,
    private sessionService: SessionService,
    private userService: UserService,
    private ratingService: RatingService,
    private savedService: SavedService,
    private router: Router, // inyectar Router
  ) { }

  ngOnInit() {
    this.currentPage = 0;
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
        this.fillSavedCars();
        // Actualiza la UI según sea necesario aquí
      },
      error: (error) => {
        console.error('Error fetching cars:', error);
      }
    });
  }

  onSearch(): void {
    this.loadCars();
    this.isExpanded = {};
  }

  openViewModal(event: MouseEvent, car: ICar): void {
    event.stopPropagation(); // Detiene la propagación del evento
    this.imageIndex = 0; // Reinicia el índice de la imagen
    this.selectedCar = car; // Establece el coche seleccionado
    console.log('Car selected:', this.selectedCar);
    this.isViewModalVisible = true; // Muestra el modal
    this.getRatingCount(this.selectedCar.owner.id);
    this.getRatingAverage(this.selectedCar.owner.id);
    this.fillSavedCars();
    document.body.classList.add('overflow-hidden');
  }

  closeViewModal(): void {
    this.isViewModalVisible = false;
    this.selectedCar = {} as ICar; // Limpia el coche seleccionado
    document.body.classList.remove('overflow-hidden');
  }

  resetBehavior(): void {
    document.body.classList.remove('overflow-hidden');
    document.scrollingElement?.scrollTo({ top: 0, behavior: 'auto' });
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
        this.fillSavedCars();
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
      if (this.isScreenSmall) {
        this.scrollToTopSm();
      } else {
        this.scrollToTop();
      }
      this.getPage(this.currentPage - 1);
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPageCount) {
      if (this.isScreenSmall) {
        this.scrollToTopSm();
      } else {
        this.scrollToTop();
      }
      this.getPage(this.currentPage + 1);
    }
  }

  changePage(pageNumber: number) {
    if (this.isScreenSmall) {
      this.scrollToTopSm();
    } else {
      this.scrollToTop();
    }
    this.isExpanded = {};
    this.getPage(pageNumber);
    
  }

  scrollToTop() {
    document.scrollingElement?.scrollTo({ top: 560, behavior: 'smooth' });
  }

  scrollToTopSm() {
    document.scrollingElement?.scrollTo({ top: 255, behavior: 'smooth' });
  }

  togglePageSize(pageSize: number) {
    this.pageSize = pageSize;
    this.getPage(0);
  }

  toggleExpansion(carId: number): void {
    this.isExpanded[carId] = !this.isExpanded[carId];
  }

  prevImage() {
    this.imageIndex--;
  }

  nextImage() {
    this.imageIndex++;
  }

  changePageCarousel(newPage: number) {
    this.imageIndex = newPage;
  }

  getRatingCount(ownerId: number): void {
    this.ratingService.getUserRatingCount(ownerId).subscribe({
      next: (ratingCount) => {
        this.ratingCount = ratingCount;
      },
      error: (error) => {
        console.error('Error al obtener la cantidad de valoraciones', error);
      },
    });
  }

  getRatingAverage(ownerId: number): void {
    this.ratingService.getUserAverageRating(ownerId).subscribe({
      next: (averageRating) => {
        this.averageRating = averageRating;
        this.updateStars(); // Intenta actualizar las estrellas
      },
      error: (error) => {
        console.error('Error al obtener la valoración media', error);
      },
    });
  }

  updateStars(): void {
    if (this.averageRating !== undefined && this.ratingCount !== undefined) {
      this.fullStars = Array(Math.floor(this.averageRating)).fill(0);
      this.halfStar = this.averageRating % 1 >= 0.5;
    }
  }

  addToSaved(carId: number): void {
    const saveBtn = document.querySelectorAll(`button[data-car-id="${carId}"]`);

    this.savedService.addToSaved(this.currentUser.id, carId).subscribe({
      next: () => {
        console.log('Coche añadido a favoritos: +', carId);
        saveBtn.forEach((btn) => {
          if (btn) {
            btn.classList.remove('text-gray-800', 'hover:text-yellow-500');
            btn.classList.add('text-yellow-500', 'hover:text-yellow-600');
          }
        });
      },
      error: (error: string) => {
        console.error('Error al añadir coche a favoritos:', error);
      },
    });
  }

  removeFromSaved(carId: number): void {
    const saveBtn = document.querySelectorAll(`button[data-car-id="${carId}"]`);

    this.savedService.removeFromSaved(this.currentUser.id, carId).subscribe({
      next: () => {
        console.log('Coche eliminado de favoritos: -', carId);
        saveBtn.forEach((btn) => {
          if (btn) {
            btn.classList.remove('text-yellow-500', 'hover:text-yellow-600');
            btn.classList.add('text-gray-800', 'hover:text-yellow-500');
          }
        });
      },
      error: (error: string) => {
        console.error('Error al eliminar coche de favoritos:', error);
      },
    });
  }

  handleFavorites(car: ICar): void {
    if (this.sessionService.isSessionActive()) {
      this.savedService.isSaved(this.currentUser.id, car.id).subscribe({
        next: (response: boolean) => {
          if (response) {
            this.removeFromSaved(car.id);
          } else {
            this.addToSaved(car.id);
          }
        }
      });
    } else {
      this.router.navigate(['/login']);
    }
  }

  fillSavedCars(): void {
    const saveBtns = document.querySelectorAll('button.save-btn');
    saveBtns.forEach((btn) => {
      btn.classList.add('text-gray-800', 'hover:text-yellow-500');
      btn.classList.remove('text-yellow-500', 'hover:text-yellow-600');
    });

    // Verifica si this.currentUser está definido y es un número antes de continuar
    if (this.currentUser && typeof this.currentUser.id === 'number') {

      // Obtén los coches favoritos del usuario actual
      this.savedService.getSavedCars(this.currentUser.id).subscribe({
        next: (savedCars: ICar[]) => {
          savedCars.forEach((car: ICar) => {

            // Encuentra el botón asociado al coche y añade la clase 'saved' para pintarlo de azul
            const saveBtn = document.querySelectorAll(`button[data-car-id="${car.id}"]`);
            saveBtn.forEach((btn) => {

              if (btn) {
                btn.classList.add('text-yellow-500', 'hover:text-yellow-600');
                btn.classList.remove('text-gray-800', 'hover:text-yellow-500');
              }
            });
          });
        },
        error: (error: string) => {
          console.error('Error al obtener coches favoritos:', error);
        },
      });
    } else {
      console.error('Usuario no autenticado');
    }
  }

  selectButton(index: number): void {
    this.selectedButtonIndex = index;
    this.isExpanded = {};
  }
}

