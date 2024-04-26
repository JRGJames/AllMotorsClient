import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from 'src/app/service/user.service';
import { ICar, IUser } from 'src/app/model/model';
import { SessionService } from 'src/app/service/session.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RatingService } from 'src/app/service/rating.service';
import { CarService } from 'src/app/service/car.service';
import { API_URL } from 'src/environment/environment';
import { SavedService } from 'src/app/service/saved.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {

  user: IUser = {} as IUser;
  currentUser: IUser = {} as IUser;
  id!: number;
  ratingCount: number = 0;
  averageRating: number = 0;
  searchFilterPosts: string = '';
  searchFilterSaved: string = '';
  cars: ICar[] = [];
  savedCars: ICar[] = [];
  url = API_URL;
  imageIndex: { [key: number]: number } = {};
  isViewModalVisible: boolean = false;
  selectedCar: ICar = {} as ICar; // Car seleccionado para mostrar en el modal
  isDeleteModalVisible: boolean = false;
  idToDelete: number | null = null;

  constructor(
    private userService: UserService,
    private sessionService: SessionService,
    private route: ActivatedRoute,
    private ratingService: RatingService,
    private carService: CarService,
    private router: Router, // inyectar Router
    private savedService: SavedService, // inyectar SavedService
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.id = +params['id'];
      if (this.id) {
        this.getUser();
        this.getCurrentUser();
        this.showPosts();
      } else {
        console.error('ID is undefined');
      }
    });
  }

  getUser(): void {
    this.userService.get(this.id).subscribe({
      next: (user: IUser) => {
        this.user = user;
        this.getRatingCount(this.id);
        this.getRatingAverage(this.id);
        this.loadCars();
        this.getSavedCars();
        this.fillSavedCars();
        console.log('Usuario cargado:', user);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error al cargar los datos del usuario:', error);
      }
    });
  }

  getCurrentUser(): void {
    if (this.sessionService.isSessionActive()) {
      const username = this.sessionService.getUsername();
      this.userService.getByUsername(username).subscribe({
        next: (user: IUser) => {
          this.currentUser = user;
          console.log('Usuario actual cargado:', user);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error al cargar los datos del usuario actual:', error);
        }
      });
    }
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
      },
      error: (error) => {
        console.error('Error al obtener la valoración media', error);
      },
    });
  }

  getStarIndexes(): number[] {
    const starCount = Math.floor(this.averageRating);
    return Array(starCount).fill(0).map((_, index) => index);
  }

  loadCars(): void {
    this.carService.getPage(100, 0, 'id', 'asc', this.user.id, this.searchFilterPosts).subscribe({
      next: (data) => {
        if (data.content.length === 0) {
          console.log('No se encontraron coches');
        }
        this.cars = data.content; // Asume que ICarPage tiene una propiedad content con los coches
        this.fillSavedCars();
      },
      error: (error) => {
        console.error('Error fetching cars:', error);
      }
    });
  }

  goToCar(id: number): void {
    this.router.navigate(['/car', id]);
    this.resetBehavior();
  }

  resetBehavior(): void {
    document.scrollingElement?.scrollTo({ top: 0, behavior: 'auto' });
    document.body.classList.remove('overflow-hidden');
    this.closeViewModal();
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

  addToSaved(carId: number): void {
    const saveBtn = document.querySelectorAll(`button[data-car-id="${carId}"]`);

    this.savedService.addToSaved(this.currentUser.id, carId).subscribe({
      next: () => {
        console.log('Coche añadido a favoritos: +', carId);
        this.getSavedCars();
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
        this.getSavedCars();
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

  onSearchPosts(): void {
    this.loadCars();
  }

  onSearchSaved(): void {
    this.getSavedCars();
  }

  isCurrentUserOwner(): boolean {
    return this.user.id === this.currentUser.id || this.currentUser.role === true;
  }

  isCurrentUserAdmin(): boolean {
    return this.currentUser.role === true;
  }

  isDifferentUser(): boolean {
    return this.user.id !== this.currentUser.id;
  }

  openDeleteModal(id: number): void {
    this.idToDelete = id;
    this.isDeleteModalVisible = true;
  }

  closeDeleteModal(): void {
    this.isDeleteModalVisible = false;
    this.idToDelete = null;
  }

  deleteUser(): void {
    if (this.idToDelete) {
      this.userService.remove(this.idToDelete).subscribe({
        next: () => {
          this.closeDeleteModal();
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('Error deleting the user', error);
          this.closeDeleteModal();
        }
      });
    }
  }

  deleteCar(carId: number): void {
    this.carService.remove(carId).subscribe({
      next: () => {
        this.goToProfile();
        this.closeViewModal();
      },
      error: (error) => {
        console.error('Error deleting the car', error);
      }
    });
  }

  goToProfile() {
    window.location.href = '/user/' + this.user.id;
  }

  showInfo(): void {
    const container = document.getElementById('tabContainer');

    if (container) {
      container.style.transform = 'translateX(0)';
    }
  }

  showPosts(): void {
    const container = document.getElementById('tabContainer');

    if (container) {
      container.style.transform = 'translateX(-33.333%)';
    }
  }

  showSaved(): void {
    const container = document.getElementById('tabContainer');


    if (container) {
      if (this.savedCars.length === 0) {
        container.classList.add('h-[30]');
        container.classList.remove('h-[51]');
      } else {
        container.classList.remove('h-[30]');
        container.classList.add('h-[51]');
      }
      container.style.transform = 'translateX(-66.666%)';
    }
  }

  getSavedCars(): void {
    this.savedService.getSavedCars(this.user.id).subscribe({
      next: (savedCars: ICar[]) => {
        this.savedCars = savedCars;
        this.fillSavedCars();
      },
      error: (error: string) => {
        console.error('Error al obtener coches favoritos:', error);
      },
    });
  }

  getUserInitials(): string {
    if (this.user.name && this.user.lastname) {
      return `${this.user.name.charAt(0)}${this.user.lastname.charAt(0)}`.toUpperCase();
    }
    return '';
  }

  uploadImage(): void {
    // Aquí puedes implementar la lógica para abrir el diálogo de selección de archivos o la página de carga de imágenes
    // Por ejemplo, puedes abrir un modal para que el usuario pueda seleccionar una nueva imagen
    console.log('Subir imagen nueva');
  }
}
