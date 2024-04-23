import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from 'src/app/service/user.service';
import { IUser } from 'src/app/model/model';
import { SessionService } from 'src/app/service/session.service';
import { ActivatedRoute } from '@angular/router';
import { RatingService } from 'src/app/service/rating.service';

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

  constructor(
    private userService: UserService,
    private sessionService: SessionService,
    private route: ActivatedRoute,
    private ratingService: RatingService

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
}
