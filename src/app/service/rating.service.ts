import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { API_URL } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  url: string = API_URL + '/rating';
  
  constructor(private http: HttpClient) { }
  
  addRating(rating: any): Observable<any> {
    return this.http.post(`${this.url}/add`, rating);
  }
  
  getUserAverageRating(userId: number): Observable<number> {
    return this.http.get<number>(`${this.url}/average/${userId}`);
  }

  getUserRatingCount(userId: number): Observable<{averageRating: number, ratingCount: number}> {
    return this.http.get<{averageRating: number, ratingCount: number}>(`${this.url}/user/${userId}/count`)
      .pipe(
        catchError(error => {
          console.error('Error en getUserRatingCount:', error);
          return throwError(error);
        })
      );
  }
  
}
