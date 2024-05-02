import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule } from "ng-apexcharts";


import { CryptoService } from './service/crypto.service';
import { SessionService } from './service/session.service';
import { UserService } from './service/user.service';
import { CarService } from './service/car.service';
import { ChatService } from './service/chat.service';
import { MessageService } from './service/message.service';
import { RatingService } from './service/rating.service';

import { TrimPipe } from './pipes/trim.pipe';
import { ThousandSeparatorPipe } from './pipes/thousandSeparator.pipe';
import { RoundToThousandthPipe } from './pipes/roundToThousandth.pipe';
import { CapitalizeFirstPipe } from './pipes/capitalizeFirst.pipe';
import { DateFormatPipe } from './pipes/dateFormat.pipe';
import { BirthdatePipe } from './pipes/birthdate.pipe';

import { AuthInterceptor } from './interceptor/auth.interceptor';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/shared/routed/login/login.component';
import { SignupComponent } from './components/shared/routed/signup/signup.component';
import { NavbarComponent } from './components/shared/unrouted/navbar/navbar.component';
import { FooterComponent } from './components/shared/unrouted/footer/footer.component';
import { HomeComponent } from './components/shared/routed/home/home.component';
import { CarDetailComponent } from './components/car/routed/car-detail/car-detail.component';
import { CarPageComponent } from './components/car/unrouted/car-page/car-page.component';
import { UserProfileComponent } from './components/user/routed/user-profile/user-profile.component';
import { CarFormComponent } from './components/car/routed/car-form/car-form.component';
import { CarEditComponent } from './components/car/routed/car-edit/car-edit.component';
import { ToastComponent } from './components/shared/unrouted/toast/toast.component';

@NgModule({
  declarations: [
    AppComponent,
    TrimPipe,
    ThousandSeparatorPipe,
    RoundToThousandthPipe,
    CapitalizeFirstPipe,
    DateFormatPipe,
    BirthdatePipe,
    LoginComponent,
    SignupComponent,
    NavbarComponent,
    FooterComponent,
    HomeComponent,
    CarFormComponent,
    CarDetailComponent,
    CarPageComponent,
    CarEditComponent,
    UserProfileComponent,
    ToastComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    NgApexchartsModule
  ],
  providers: [
    SessionService,
    UserService,
    CarService,
    ChatService,
    MessageService,
    CryptoService,
    RatingService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }