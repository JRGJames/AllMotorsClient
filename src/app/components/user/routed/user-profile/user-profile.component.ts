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
  searchFilter: string = '';
  cars: ICar[] = [];
  url = API_URL;

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
    this.carService.getPage(100, 0, 'id', 'asc', this.user.id, this.searchFilter).subscribe({
      next: (data) => {
        if (data.content.length === 0) {
          console.log('No se encontraron coches');
        }
        this.cars = data.content; // Asume que ICarPage tiene una propiedad content con los coches
        console.log('Coches cargados:', this.cars);
        // this.totalElements = data.totalElements;
        this.fillSavedCars();
      },
      error: (error) => {
        console.error('Error fetching cars:', error);
      }
    });
  }

  goToCar(id: number): void {
    this.router.navigate(['/car', id]);
  }

  resetBehavior(): void {
    document.body.classList.remove('overflow-hidden');
    document.scrollingElement?.scrollTo({ top: 0, behavior: 'auto' });
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
}
