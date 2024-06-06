import { Injectable } from '@angular/core';
import { API_URL } from '../../environment/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ICar } from '../model/model';

@Injectable({
  providedIn: 'root'
})

export class SavedService {

  url: string = API_URL + '/favorites';

  constructor(
    private http: HttpClient
  ) { }

  addToSaved(userId: number, carId: number): Observable<number> {
    let params = new HttpParams().set('userId', userId.toString()).set('carId', carId.toString());
    return this.http.post<number>(this.url + '/add', {}, { params: params });
  }

  removeFromSaved(userId: number, carId: number): Observable<number> {
    let params = new HttpParams().set('userId', userId.toString()).set('carId', carId.toString());
    return this.http.delete<number>(this.url + '/remove', { params: params });
  }

  isSaved(userId: number, carId: number): Observable<boolean> {
    return this.http.get<boolean>(this.url + `/status?userId=${userId}&carId=${carId}`);
  }

  getSavedCars(userId: number, strFilter?: string): Observable<ICar[]> {
    let url_filter: string = strFilter ? `?filter=${encodeURIComponent(strFilter)}` : "";

    return this.http.get<ICar[]>(`${this.url}/get/${userId}${url_filter}`);
}


  countSaves(carId: number): Observable<number> {
    return this.http.get<number>(this.url + `/count/${carId}`);
  }

  increaseSaves(carId: number): Observable<number> {
    return this.http.post<number>(this.url + `/increase/${carId}`, null);
  }

  decreaseSaves(carId: number): Observable<number> {
    return this.http.post<number>(this.url + `/decrease/${carId}`, null);
  }
}
