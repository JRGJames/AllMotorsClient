import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IMessage } from '../model/model';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: WebSocket;

  constructor() {
    this.socket = new WebSocket('ws://localhost:8083/chat');
  }

  public connect(): Observable<IMessage> {
    return new Observable(observer => {
      this.socket.onmessage = (event) => {
        try {
          const message: IMessage = JSON.parse(event.data);
          observer.next(message);
        } catch (e) {
          observer.error(`Error parsing message: ${e} - Message: ${event.data}`);
        }
      };
      this.socket.onerror = (event) => observer.error(event);
      this.socket.onclose = () => observer.complete();
    });
  }

  public sendMessage(message: IMessage): void {
    const jsonMessage = JSON.stringify(message);

    this.socket.send(jsonMessage);
  }
}