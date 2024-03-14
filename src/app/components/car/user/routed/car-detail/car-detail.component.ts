import { UserService } from '../../../../../service/user.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ICar, IImage, IRating, IUser } from 'src/app/model/model';
import { CarService } from 'src/app/service/car.service';
import { RatingService } from 'src/app/service/rating.service';
import { SessionService } from 'src/app/service/session.service';
import { API_URL } from 'src/environment/environment';

@Component({
  selector: 'app-car-detail',
  templateUrl: './car-detail.component.html',
  styleUrls: ['./car-detail.component.css'],
})
export class CarDetailComponent implements OnInit {
  url = API_URL;
  showPhoneNumber: boolean = false;
  id!: number;
  imageIndex: number = 0;
  averageRating: number = 0;
  ratingCount: number =  0;
  car: ICar = { owner: {} } as ICar;
  status: HttpErrorResponse | null = null;
  currentUser: IUser = {} as IUser;
  isDeleteModalVisible: boolean = false;
  idToDelete: number | null = null;

  constructor(
    private carService: CarService,
    private sessionService: SessionService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private ratingService: RatingService

  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.id = +params['id'];
      if (this.id) {
        this.getCurrentUser();
        this.getOne();
      } else {
        console.error('ID is undefined');
      }
    });
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

  getOne(): void {
    this.carService.get(this.id).subscribe({
      next: (data: ICar) => {
        this.car = data;
        this.increaseViews(this.car.id);
        this.getRatingCount(this.car.owner.id);
        this.getRatingAverage(this.car.owner.id);
      },
      error: (error: HttpErrorResponse) => {
        this.status = error;
      }
    });
  }

  prevImage() {
    this.imageIndex--;
  }

  nextImage() {
    this.imageIndex++;
  }

  changePage(newPage: number) {
    this.imageIndex = newPage;
  }

  togglePhoneNumber(): void {
    this.showPhoneNumber = !this.showPhoneNumber;
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

  increaseViews(carId: number): void {
    this.carService.increaseViews(carId).subscribe({
      error: (error) => {
        console.error('Error increasing views', error);
      },
    })
  }

  handleFavorites(car: ICar): void {
    if (!this.sessionService.isSessionActive()) {
      this.router.navigate(['/login']);
    } else {
      console.log('Añadir a favoritos:', car);
    }
  }

  isCurrentUserOwner(): boolean {
    return this.car.owner.id === this.currentUser.id || this.currentUser.role === true;
  }

  openDeleteModal(id: number): void {
    this.idToDelete = id;
    this.isDeleteModalVisible = true;
  }

  closeDeleteModal(): void {
    this.isDeleteModalVisible = false;
    this.idToDelete = null;
  }

  // Función para manejar la eliminación
  deleteCar(): void {
    if (this.idToDelete) {
      this.carService.remove(this.idToDelete).subscribe({
        next: () => {
          this.closeDeleteModal();
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('Error deleting the car', error);
          this.closeDeleteModal();
        }
      });
    }
  }
}
