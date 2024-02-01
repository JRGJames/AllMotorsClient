import { UserService } from './user.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { API_URL } from 'src/environment/environment';
import { IToken, IUser, SessionEvent } from '../model/model';
import { Injectable } from '@angular/core';

@Injectable()
export class SessionService {

    sUrl: string = API_URL + "/session";

    subjectSession = new Subject<SessionEvent>();

    constructor(
        private http: HttpClient,
        private userService: UserService
    ) { }

    private parseJwt(token: string): IToken {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    }

    login(sIdentifier: string, sPassword: string): Observable<string> {
        const isEmail = sIdentifier.includes('@');
        const payload = isEmail
            ? { email: sIdentifier, password: sPassword }
            : { username: sIdentifier, password: sPassword };

        return this.http.post<string>(`${this.sUrl}/login`, payload);
    }


    setToken(token: string): void {
        localStorage.setItem('token', token);
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    logout(): void {
        localStorage.removeItem('token');
    }

    isSessionActive(): Boolean {
        let strToken: string | null = localStorage.getItem('token');
        if (strToken) {
            let decodedToken: IToken = this.parseJwt(strToken);
            if (Date.now() >= decodedToken.exp * 1000) {
                return false;
            } else {
                return true;
            }
        } else {
            return false;
        }
    }

    getUsername(): string {
        if (this.isSessionActive()) {
            let token: string | null = localStorage.getItem('token');
            if (!token) {
                return "";
            } else {
                return this.parseJwt(token).name;
            }
        } else {
            return "";
        }
    }

    on(): Observable<SessionEvent> {
        return this.subjectSession.asObservable();
    }

    emit(oEvent: SessionEvent): void {
        this.subjectSession.next(oEvent);
    }

    getSessionUser(): Observable<IUser> | null {
        if (this.isSessionActive()) {
            return this.userService.getByUsername(this.getUsername())
        } else {
            return null;
        }
    }

}