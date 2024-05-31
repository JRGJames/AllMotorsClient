import { Injectable } from '@angular/core';
import { API_URL } from '../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { ICar, IChat, IMessage, IUser } from '../model/model';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class ChatService {

    url: string = API_URL + '/chat';

    constructor(
        private http: HttpClient
    ) { }

    getAll(userId: number): Observable<IChat[]> {
        return this.http.get<IChat[]>(`${this.url}/get/${userId}`);
    }

    getMessages(chatId: number): Observable<IMessage[]> {
        return this.http.get<IMessage[]>(`${this.url}/messages/${chatId}`);
    }

    // getMessagesNotRead(chatId: number, user: IUser): Observable<number> {
    //     return this.http.get<number>(`${this.url}/getNotRead/${chatId}`, {
    //         params: { userId: userId.toString() }
    //     });
    // }

    create(memberOne: IUser, memberTwo: IUser, car: ICar) {
        return this.http.post(this.url + '/create', { memberOne, memberTwo, car });
    }

}
