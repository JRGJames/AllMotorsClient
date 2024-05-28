import { Injectable } from '@angular/core';
import { API_URL } from '../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { ICar, IChat, IUser } from '../model/model';
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

    create(memberOne: IUser, memberTwo: IUser, car: ICar) {
        return this.http.post(this.url + '/create', { memberOne, memberTwo, car });
    }

}
