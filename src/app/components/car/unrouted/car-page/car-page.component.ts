import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ICar, ICarPage, IUser } from 'src/app/model/model';
import { CarService } from 'src/app/service/car.service';
import { SessionService } from 'src/app/service/session.service';
import { Router } from '@angular/router';
import { UserService } from 'src/app/service/user.service';
import { API_URL_MEDIA } from 'src/environment/environment';
import { RatingService } from 'src/app/service/rating.service';
import { SavedService } from 'src/app/service/saved.service';
import { catchError, Observable, of } from 'rxjs';


@Component({
  selector: 'app-car-page',
  templateUrl: './car-page.component.html',
  styleUrls: ['./car-page.component.css']
})
export class CarPageComponent implements OnInit {
  urlImage = API_URL_MEDIA;
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
  imageIndex: { [key: number]: number } = {};
  fullStars: { key: number, stars: number }[] = [];
  selectedButtonIndex: number = 0;

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
        if (data.content.length === 0) {
          console.log('No se encontraron coches');
        }
        this.cars = data.content; // Asume que ICarPage tiene una propiedad content con los coches
        this.totalPageCount = data.totalPages;
        this.totalElements = data.totalElements;
        this.currentPage = 0;
        this.fillSavedCars();
        this.getAllRatings();
        for (const car of data.content) { // 'cars' sería tu lista de coches
          this.imageIndex[car.id] = 0;
        }
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
    if (window.innerWidth < 640) {
      this.scrollToTopSm();
    } else {
      this.scrollToTop();
    }
  }

  openViewModal(event: MouseEvent, car: ICar): void {
    event.stopPropagation(); // Detiene la propagación del evento
    this.imageIndex[car.id] = 0; // Reinicia el índice de la imagen
    this.selectedCar = car; // Establece el coche seleccionado
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

  goToCar(car: ICar): void {
    this.router.navigate(['/car', car.id]);
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
      this.getPage(this.currentPage - 1);
      this.isExpanded = {};
      if (window.innerWidth < 640) {
        this.scrollToTopSm();
      } else {
        this.scrollToTop();
      }
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPageCount) {
      this.getPage(this.currentPage + 1);
      this.isExpanded = {};

      if (window.innerWidth < 640) {
        this.scrollToTopSm();
      } else {
        this.scrollToTop();
      }
    }
  }

  public changePage(pageNumber: number) {
    this.isExpanded = {};
    this.getPage(pageNumber);
    if (window.innerWidth < 640) {
      this.scrollToTopSm();
    } else {
      this.scrollToTop();
    }

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

  prevImage(event: MouseEvent, car: ICar) {
    event.stopPropagation(); // Detiene la propagación del evento
    this.imageIndex[car.id] = this.imageIndex[car.id] - 1;
  }

  nextImage(event: MouseEvent, car: ICar) {
    event.stopPropagation(); // Detiene la propagación del evento
    this.imageIndex[car.id] = this.imageIndex[car.id] + 1;
  }

  changePageCarousel(index: number, car: ICar) {
    this.imageIndex[car.id] = index;
  }

  getAllRatings(): void {
    this.getAllRatingCount();
    this.getAllRatingsAverage();
  }

  getAllRatingCount(): void {
    this.cars.forEach((car) => {
      this.getRatingCount(car.owner.id).subscribe(ratingCount => {
        car.owner.ratingCount = ratingCount;
      });

    });
  }

  getRatingCount(ownerId: number): Observable<number> {
    return this.ratingService.getUserRatingCount(ownerId).pipe(
      catchError(error => {
        console.error('Error al obtener la cantidad de valoraciones', error);
        return of(0); // Devuelve un observable que emite 0 en caso de error
      })
    );
  }

  getAllRatingsAverage(): void {
    this.cars.forEach((car) => {
      this.getRatingAverage(car.owner.id).subscribe(ratingAverage => {
        car.owner.ratingAverage = ratingAverage;
        this.updateStars(car);
      });
    });
  }

  getRatingAverage(ownerId: number): Observable<number> {
    return this.ratingService.getUserAverageRating(ownerId).pipe(
      catchError(error => {
        console.error('Error al obtener la cantidad de valoraciones', error);
        return of(0); // Devuelve un observable que emite 0 en caso de error
      })
    );
  }

  updateStars(car: ICar): void {
    // Verificar si el ownerId ya está ocupado en fullStars
    const keyExistsFullStars = this.fullStars.some(item => item.key === car.owner.id);

    // Si el ownerId no está ocupado, añadir las estrellas
    if (car.owner.ratingAverage > 0) {
      if (!keyExistsFullStars) {
        this.fullStars.push({ key: car.owner.id, stars: Math.floor(car.owner.ratingAverage) });
      }
    }
  }

  getStarRange(ownerId: number): number[] {
    const starsCount = this.fullStars.find(item => item.key === ownerId)?.stars || 0;
    return Array.from({ length: starsCount }, (_, index) => index);
  }

  addToSaved(carId: number): void {
    const saveBtn = document.querySelectorAll(`button[data-car-id="${carId}"]`);

    this.savedService.addToSaved(this.currentUser.id, carId).subscribe({
      next: () => {
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

  isCurrentUserOwner(selectedCar: ICar): boolean {
    return selectedCar.owner.id === this.currentUser.id || this.currentUser.role === true;
  }

  deleteCar(carId: number): void {
    this.carService.remove(carId).subscribe({
      next: () => {
        this.goToHome();
        this.closeViewModal();
      },
      error: (error) => {
        console.error('Error deleting the car', error);
      }
    });
  }

  goToHome() {
    window.location.href = '/home';
  }

}

