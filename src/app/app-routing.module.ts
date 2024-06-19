import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './components/shared/routed/home/home.component';
import { LoginComponent } from './components/shared/routed/login/login.component'; 
import { SignupComponent } from './components/shared/routed/signup/signup.component';
import { CarFormComponent } from './components/car/routed/car-form/car-form.component';
import { CarDetailComponent } from './components/car/routed/car-detail/car-detail.component';
import { UserProfileComponent } from './components/user/routed/user-profile/user-profile.component';
import { ChatListComponent } from './components/chat/routed/chat-list/chat-list.component';
import { UserFormComponent } from './components/user/routed/user-form/user-form.component';

const routes: Routes = [

  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent},
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'upload', component: CarFormComponent },
  { path: 'car/:id' , component: CarDetailComponent },
  { path: 'user/:id', component: UserProfileComponent },
  { path: 'chats', component: ChatListComponent },
  { path: 'activate', component: UserFormComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
