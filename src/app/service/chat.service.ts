import { Injectable } from '@angular/core';
import { API_URL } from '../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { ICar, IChat, IUser } from '../model/model';

@Injectable({
    providedIn: 'root'
})

export class ChatService {

    url: string = API_URL + '/chat';

    constructor(
        private http: HttpClient
    ) { }

    getAll(id: number) {
        return this.http.get(this.url + '/get' + id);
    }

    create(memberOne: IUser, memberTwo: IUser, car: ICar) {
        return this.http.post(this.url + '/create', { memberOne, memberTwo, car });
    }

}
