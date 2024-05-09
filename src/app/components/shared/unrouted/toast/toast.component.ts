// toast.component.ts

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastService } from '../../../../service/toast.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css']
})
export class ToastComponent implements OnInit, OnDestroy {
  message: string = '';
  private subscription: Subscription = new Subscription();

  constructor(private toastService: ToastService) { }

  ngOnInit(): void {
    this.subscription = this.toastService.message$.subscribe(message => {
      this.message = message;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
