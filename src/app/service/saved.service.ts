import { Injectable } from '@angular/core';
import { API_URL } from '../../environment/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

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
    return this.http.post<number>(this.url + '/add', {}, {params: params});
  }

  removeFromSaved(userId: number, carId: number): Observable<number> {
    let params = new HttpParams().set('userId', userId.toString()).set('carId', carId.toString());
    return this.http.delete<number>(this.url + '/remove', {params: params});
  }

  isSaved(userId: number, carId: number): Observable<boolean> {
    return this.http.get<boolean>(this.url + `/status?userId=${userId}&carId=${carId}`);
  }

  getSavedCars(userId: number): Observable<number[]> {
    return this.http.get<number[]>(this.url + `/get/${userId}`);
  }
}
