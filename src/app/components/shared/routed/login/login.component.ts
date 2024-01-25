import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CryptoService } from 'src/app/service/crypto.service';
import { SessionService } from 'src/app/service/session.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  status: HttpErrorResponse | null = null;
  passwordVisible = false; // Variable para controlar la visibilidad de la contraseña
  backgroundImage: string = '';
  
  constructor(
    private fb: FormBuilder,
    private sessionService: SessionService,
    private router: Router,
    private cryptoService: CryptoService,
    ) {
      this.loginForm = this.fb.group({
        usernameOrEmail: ['', [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(8)]],
      });
    }

  ngOnInit() {
    const images = [
      'image1.jpg',
      'image2.jpg',
      'image3.jpg',
      'image4.jpg',
      'image5.jpg',
      'image6.jpg',
      'image7.jpg',
      'image8.jpg',
      'image9.jpg',
      'image10.jpg'
    ];
  
    const randomImage = images[Math.floor(Math.random() * images.length)];
  
    this.backgroundImage = `url(assets/images/${randomImage})`;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const username = this.loginForm.value.usernameOrEmail;
      const hashedPassword = this.cryptoService.getSHA256(this.loginForm.value.password);

      this.sessionService.login(username, hashedPassword).subscribe({
        next: (data: string) => {
          this.sessionService.setToken(data);
          this.sessionService.emit({ type: 'login' });
          this.router.navigate(['/']);
        },
        error: (error: HttpErrorResponse) => {
          this.status = error;
          this.loginForm.reset();
        }
      });
    }
  }

  loginAdmin() {
    this.loginForm.setValue({
      usernameOrEmail: 'ElNano',
      password: '33333333',
    });
  }

  loginUser() {
    this.loginForm.setValue({
      usernameOrEmail: 'carlossainz',
      password: '33333333',
    });
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  // Método para obtener el tipo de entrada de contraseña
  getPasswordInputType() {
    return this.passwordVisible ? 'text' : 'password';
  }
}
