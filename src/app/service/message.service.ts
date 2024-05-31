import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API_URL } from 'src/environment/environment';
import { IMessage } from '../model/model';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  messageSent: EventEmitter<void> = new EventEmitter<void>();
  url: string = API_URL + '/message';

  constructor(
    private http: HttpClient
  ) { }

  getAll(id: number): Observable<IMessage[]> {
    return this.http.get<IMessage[]>(this.url + '/getAll/' + id);
  }

  send(message: IMessage, carId?: number): Observable<IMessage> {
    // Construimos la URL con el parámetro opcional carId
    let url = this.url + '/send';
    if (carId !== undefined && carId !== null) {
      url += `?carId=${carId}`;
    }

    // Enviamos el mensaje en el cuerpo de la solicitud
    return this.http.post<IMessage>(url, message).pipe(tap(() => {
      this.messageSent.emit();
    }
    ));
  }

  like(id: number, liked: boolean): Observable<void> {
    return this.http.put<void>(`${this.url}/like/${id}?liked=${liked}`, {});
  }

  delete(id: number): Observable<number> {
    return this.http.delete<number>(this.url + '/delete/' + id);
  }

  count(id: number): Observable<number> {
    return this.http.get<number>(this.url + '/count/' + id);
  }
}