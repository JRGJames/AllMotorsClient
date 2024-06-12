import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { IMessage } from '../model/model';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket!: WebSocket;
  private readonly socketUrl = 'ws://initial/chat';

  constructor() { }

  public connect(chatId: number): Observable<IMessage> {
    // Cerrar la conexión WebSocket actual si existe
    if (this.socket) {
      this.socket.close();
    }

    // Abrir una nueva conexión WebSocket con el nuevo chatId
    this.socket = new WebSocket(`${this.socketUrl}?chatId=${chatId}`);
    
    return new Observable((observer: Observer<IMessage>) => {
      this.socket.onopen = () => {
        console.log('WebSocket connected successfully');
      };

      this.socket.onmessage = (event) => {
        try {
          const message: IMessage = JSON.parse(event.data);
          observer.next(message);
        } catch (e) {
          observer.error(`Error parsing message: ${e} - Message: ${event.data}`);
        }
      };

      this.socket.onerror = (event) => observer.error(event);
      this.socket.onclose = () => {
        console.log('WebSocket connection closed');
        observer.complete();
      };
    });
  }

  public sendMessage(message: IMessage): void {
    if (this.socket.readyState === WebSocket.OPEN) {
      const jsonMessage = JSON.stringify(message);
      this.socket.send(jsonMessage);
    } else {
      console.error('WebSocket is not open');
    }
  }
}
