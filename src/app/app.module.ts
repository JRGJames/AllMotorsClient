import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { GoogleMapsModule } from '@angular/google-maps';



import { CryptoService } from './service/crypto.service';
import { SessionService } from './service/session.service';
import { UserService } from './service/user.service';
import { CarService } from './service/car.service';
import { ChatService } from './service/chat.service';
import { MessageService } from './service/message.service';

import { TrimPipe } from './pipes/trim.pipe';
import { ThousandSeparatorPipe } from './pipes/thousandSeparator.pipe';
import { RoundToThousandthPipe } from './pipes/roundToThousandth.pipe';

import { AuthInterceptor } from './interceptor/auth.interceptor';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/shared/routed/login/login.component';
import { SignupComponent } from './components/shared/routed/signup/signup.component';
import { NavbarComponent } from './components/shared/unrouted/navbar/navbar.component';
import { FooterComponent } from './components/shared/unrouted/footer/footer.component';
import { CarFormComponent } from './components/car/admin/routed/car-form/car-form.component';
import { CarDetailComponent } from './components/car/admin/routed/car-detail/car-detail.component';





@NgModule({
  declarations: [
    AppComponent,
    TrimPipe,
    ThousandSeparatorPipe,
    RoundToThousandthPipe,
    LoginComponent,
    SignupComponent,
    NavbarComponent,
    FooterComponent,
    CarFormComponent,
    CarDetailComponent,
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    GoogleMapsModule 
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