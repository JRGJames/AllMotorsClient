import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MediaService {

  constructor(
    private http: HttpClient
  ) { }

  uploadMultipleFiles(formData: FormData): Observable<any> {
    return this.http.post('http://localhost:8083/media/upload', formData);
  }

}
