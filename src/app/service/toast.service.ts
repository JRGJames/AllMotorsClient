import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  private messageSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public message$: Observable<string> = this.messageSubject.asObservable();

  constructor() { }

  show(message: string): void {
    this.messageSubject.next(message);

    timer(3000).subscribe(() => {
      this.messageSubject.next('');
    });
  }
}
