import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_URL } from 'src/environment/environment';
import { IUser, IUserPage } from '../model/model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  url: string = API_URL + '/user';

  constructor(
    private http: HttpClient
  ) { }

  checkUsernameNotTaken(username: string): Observable<boolean> {
    return this.http.get<{ isUsernameAvailable: boolean }>(this.url + '/username-check', {
      params: { username }
    }).pipe(
      map(response => response.isUsernameAvailable)
    );
  }

  checkEmailNotTaken(email: string): Observable<boolean> {
    return this.http.get<{ isEmailAvailable: boolean }>(this.url + '/email-check', {
      params: { email }
    }).pipe(
      map(response => response.isEmailAvailable)
    );
  }

  get(id: number): Observable<IUser> {
    return this.http.get<IUser>(this.url + '/get/' + id);
  }

  getByUsername(name: string): Observable<IUser> {
    return this.http.get<IUser>(this.url + '/byUsername/' + name);
  }

  getPage(page: number | undefined, size: number | undefined, orderField: string, orderDirection: string, strFilter?: string): Observable<IUserPage> {
    let url_filter: string;
    if (!size) size = 10;
    if (!page) page = 0;
    if (strFilter && strFilter.trim().length > 0) {
      url_filter = `&filter=${strFilter}`;
    } else {
      url_filter = '';
    }
    return this.http.get<IUserPage>(this.url + '/getPage?size=' + size + '&page=' + page + '&sort=' + orderField + ',' + orderDirection + url_filter);
  }

  create(user: IUser): Observable<IUser> {
    return this.http.post<IUser>(this.url + '/create', user);
  }

  remove(id: number | undefined): Observable<number> {
    if (id) {
      return this.http.delete<number>(this.url + '/delete/' + id);
    }
    return new Observable<number>();
  }

  update(user: IUser): Observable<IUser> {
    return this.http.put<IUser>(this.url + '/update', user);
  }

  generateRandom(amount: number): Observable<number> {
    return this.http.post<number>(this.url + "/populate/" + amount, null);
  }

  empty(): Observable<number> {
    return this.http.delete<number>(this.url + "/empty");
  }


}