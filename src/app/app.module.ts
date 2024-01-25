import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';


import { CryptoService } from './service/crypto.service';
import { SessionService } from './service/session.service';
import { UserService } from './service/user.service';
import { CarService } from './service/car.service';
import { ChatService } from './service/chat.service';
import { MessageService } from './service/message.service';

import { TrimPipe } from './pipes/trim.pipe';

import { AuthInterceptor } from './interceptor/auth.interceptor';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/shared/routed/login/login.component';
import { SignupComponent } from './components/shared/routed/signup/signup.component';
import { NavbarComponent } from './components/shared/unrouted/navbar/navbar.component';
import { UserUserDetailUnroutedComponent } from './components/user/user/user-user-detail-unrouted/user-user-detail-unrouted.component';




@NgModule({
  declarations: [
    AppComponent,
    TrimPipe,
    NavbarComponent,
    LoginComponent,
    SignupComponent,
    UserUserDetailUnroutedComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
  ],
  providers: [
    SessionService,
    UserService,
    CarService,
    ChatService,
    MessageService,
    CryptoService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }