import { Injectable } from '@angular/core';
import { API_URL } from '../../environment/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class FavoriteService {

  url: string = API_URL + '/favorites';

  constructor(
    private http: HttpClient
  ) { }

  addToFavorites(userId: number, carId: number): Observable<number> {
    let params = new HttpParams().set('userId', userId.toString()).set('carId', carId.toString());
    return this.http.post<number>(this.url + '/add', {}, {params: params});
  }

  removeFromFavorites(userId: number, carId: number): Observable<number> {
    let params = new HttpParams().set('userId', userId.toString()).set('carId', carId.toString());
    return this.http.delete<number>(this.url + '/remove', {params: params});
  }

  isFavorite(userId: number, carId: number): Observable<boolean> {
    let params = new HttpParams().set('userId', userId.toString()).set('carId', carId.toString());
    return this.http.get<boolean>(this.url + `/isFavorite`, { params: params });
  }
}
