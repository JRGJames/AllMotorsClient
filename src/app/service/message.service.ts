import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from 'src/environment/environment';
import { IMessage } from '../model/model';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  url: string = API_URL + '/message';

  constructor(
    private http: HttpClient
  ) { }

  getAll(id: number): Observable<IMessage[]> {
    return this.http.get<IMessage[]>(this.url + '/getAll/' + id);
  }

  send(message: IMessage, carId: number): Observable<IMessage> {
    return this.http.post<IMessage>(this.url + '/send/' + message, carId);
  }

  delete(id: number): Observable<number> {
    return this.http.delete<number>(this.url + '/delete/' + id);
  }

  count(id: number): Observable<number> {
    return this.http.get<number>(this.url + '/count/' + id);
  }
}