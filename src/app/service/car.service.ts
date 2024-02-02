import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ICar, ICarPage } from '../model/model';
import { API_URL } from 'src/environment/environment';

@Injectable()
export class CarService {

    url: string = API_URL + '/car';

    constructor(
      private http: HttpClient
    ) { }
  
    get(id: number): Observable<ICar> {
      return this.http.get<ICar>(this.url + '/get/' + id);
    }
  
    getPage(page: number | undefined, size: number | undefined, orderField: string, orderDirection: string, strFilter?: string): Observable<ICarPage> {
      let url_filter: string;
      if (!size) size = 15;
      if (!page) page = 0;
      if (strFilter && strFilter.trim().length > 0) {
        url_filter = `&filter=${strFilter}`;
      } else {
        url_filter = '';
      }
      return this.http.get<ICarPage>(this.url + '?size=' + size + '&page=' + page + '&sort=' + orderField + ',' + orderDirection + url_filter);
    }
  
    create(car: ICar): Observable<ICar> {
      return this.http.post<ICar>(this.url + '/create', car);
    }
  
    remove(id: number | undefined): Observable<number> {
      if (id) {
        return this.http.delete<number>(this.url + '/delete/' + id);
      }
      return new Observable<number>();
    }
  
    update(car: ICar): Observable<ICar> {
      return this.http.put<ICar>(this.url + '/update', car);
    }
  
    generateRandom(amount: number): Observable<number> {
      return this.http.post<number>(this.url + "/populate/" + amount, null);
    }
  
    empty(): Observable<number> {
      return this.http.delete<number>(this.url + "/empty");
    }

    byViews(amount: number): Observable<ICar[]> {
      return this.http.get<ICar[]>(this.url + "/get/byViews/" + amount);
    }
  
}
