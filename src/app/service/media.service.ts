import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from 'src/environment/environment';
import { IImage } from '../model/model';

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

  createCarImage(formData: FormData, carId: number): Observable<any> {
    return this.http.post<any>(this.url + `/create/${carId}`, formData);
  }
}
