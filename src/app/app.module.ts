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
import { ToastService } from './service/toast.service';

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
import { ChatListComponent } from './components/chat/routed/chat-list/chat-list.component';
import { ChatComponent } from './components/chat/unrouted/chat/chat.component';
import { DatePipe } from '@angular/common';
import { TimeOnlyPipe } from './pipes/timeOnly.pipe';
import { UserFormComponent } from './components/user/routed/user-form/user-form.component';

@NgModule({
  declarations: [
    AppComponent,
    TrimPipe,
    ThousandSeparatorPipe,
    RoundToThousandthPipe,
    CapitalizeFirstPipe,
    TimeOnlyPipe,
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
    UserProfileComponent,
    ChatListComponent,
    ChatComponent,
    UserFormComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    NgApexchartsModule,
  ],
  providers: [
    SessionService,
    UserService,
    CarService,
    ChatService,
    MessageService,
    CryptoService,
    RatingService,
    ToastService,
    DatePipe,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  exports: [
    TrimPipe,
    ThousandSeparatorPipe,
    RoundToThousandthPipe,
    CapitalizeFirstPipe,
    DateFormatPipe,
    BirthdatePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }