import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './components/shared/routed/home/home.component';
import { LoginComponent } from './components/shared/routed/login/login.component'; 
import { SignupComponent } from './components/shared/routed/signup/signup.component';
import { CarFormComponent } from './components/car/admin/routed/car-form/car-form.component';
import { CarDetailComponent } from './components/car/admin/routed/car-detail/car-detail.component';

const routes: Routes = [

  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent},
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'upload', component: CarFormComponent },
  { path: 'car/:id', component: CarDetailComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
