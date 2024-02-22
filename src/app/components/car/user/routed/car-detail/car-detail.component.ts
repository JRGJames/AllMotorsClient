import { UserService } from '../../../../../service/user.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ICar, IImage, IUser } from 'src/app/model/model';
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
  imageIndex = 0;
  images: IImage[] = [];
  averageRating: number | null = null;
  ratingCount: number | null = null;
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
        this.getRatingCount(this.id);
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
        this.getRatingCount(this.car.owner.id);
      },
      error: (error: HttpErrorResponse) => {
        this.status = error;
      }
    });
  }

  prevImage() {
    if (this.imageIndex > 0) {
      this.imageIndex--;
    }
  }

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

  getRatingCount(ownerId: number): void {
    this.ratingService.getUserRatingCount(ownerId).subscribe({
      next: (ratingCount) => {
        this.ratingCount = ratingCount;
        console.log('Total de valoraciones:', this.ratingCount);
      },
      error: (error) => {
        console.error('Error al obtener la cantidad de valoraciones', error);
      },
      complete: () => console.log('Operación de obtención del conteo de rating completada.')
    });
  }

  handleBookmarkClick(car: ICar): void {
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
        next: (result) => {
          console.log(`Car with ID ${this.idToDelete} was deleted`);
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
