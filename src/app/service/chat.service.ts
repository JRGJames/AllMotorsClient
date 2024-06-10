import { Injectable } from '@angular/core';
import { API_URL } from '../../environment/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
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

    getMessagesNotRead(chatId: number, user: IUser): Observable<number> {
        const params = new HttpParams().set('userId', user.id.toString());

        return this.http.get<number>(`${this.url}/getUnread/${chatId}`, { params });
    }

    create(memberOne: IUser, memberTwo: IUser, car: ICar) {
        return this.http.post(this.url + '/create', { memberOne, memberTwo, car });
    }

    getByUsers(memberOne: IUser, memberTwo: IUser): Observable<IChat> {
        const params = new HttpParams()
            .set('memberOne', memberOne.id.toString())
            .set('memberTwo', memberTwo.id.toString());

        return this.http.get<IChat>(`${this.url}/getByUsers`, { params });
    }

    getByUsersCar(memberOne: IUser, memberTwo: IUser, car: ICar): Observable<IChat> {
        const params = new HttpParams()
            .set('memberOne', memberOne.id.toString())
            .set('memberTwo', memberTwo.id.toString())
            .set('car', car.id.toString());

        return this.http.get<IChat>(`${this.url}/getByUsersCar`, { params });
    }

}
