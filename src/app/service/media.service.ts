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

  getCarImage(imageId: number): Observable<any> {
    return this.http.get<any>(this.url + `/get/${imageId}`);
  }
  
  getCarImages(carId: number): Observable<any> {
    return this.http.get<any>(this.url + `/getByCar/${carId}`);
  }

  deleteCarImage(imageId: number): Observable<any> {
    return this.http.delete<any>(this.url + `/delete/${imageId}`);
  }

  updateCarImage(image: IImage): Observable<IImage> {
    return this.http.put<IImage>(this.url + '/update', image);
  }

  createCarImage(formData: FormData, image: IImage): Observable<IImage> {
    return this.http.post<IImage>(this.url + '/create', formData, { params: new HttpParams().set('image', JSON.stringify(image)) });
  }
  
  

}
