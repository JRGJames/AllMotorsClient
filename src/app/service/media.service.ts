import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from 'src/environment/environment';
import { ICar, IImage } from '../model/model';

@Injectable({
  providedIn: 'root'
})
export class MediaService {
  url: string = API_URL + '/media';

  constructor(
    private http: HttpClient
  ) { }

  uploadPicture(formData: FormData, userId: number): Observable<any> {
    return this.http.post<any>(this.url + `/upload/picture/${userId}`, formData);
  }

  uploadBackground(formData: FormData, userId: number): Observable<any> {
    return this.http.post<any>(this.url + `/upload/background/${userId}`, formData);
  }

  deleteCarImage(imageId: number): Observable<any> {
    return this.http.delete<any>(this.url + `/delete/${imageId}`);
  }

  createCarImage(formData: FormData, car?: ICar, carId?: number): Observable<any> {
    let url: string;

    if (car) {
        url = `${this.url}/create/${car}`;
    } else if (carId) {
        url = `${this.url}/create/${carId}`;
    } else {
        throw new Error('Neither car nor carId was provided.');
    }

    return this.http.post<any>(url, formData);
}

}
