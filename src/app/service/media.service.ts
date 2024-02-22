import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class MediaService {
  url = API_URL;

  constructor(
    private http: HttpClient
  ) { }

  uploadMultipleFiles(formData: FormData): Observable<any> {
    return this.http.post(this.url + "/media/upload", formData);
  }

}
