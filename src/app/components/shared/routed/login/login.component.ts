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
  submitted: boolean = false;
  status: HttpErrorResponse | null = null;
  passwordVisible = false; // Variable para controlar la visibilidad de la contraseña
  backgroundImage: string = '';
  errorMessage: string = '';
  loginError: boolean = false;

  userMessage: string = '';
  errorUser: boolean = false;

  passMessage: string = '';
  errorPass: boolean = false;

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
      'image1.webp',
      'image2.webp',
      'image3.webp',
      'image4.webp'
    ];

    const randomImage = images[Math.floor(Math.random() * images.length)];

    this.backgroundImage = `url(assets/images/${randomImage})`;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      if (this.loginForm.get('usernameOrEmail')?.invalid) {
        this.userMessage = 'Please, enter a username or email.';
        this.errorUser = true;
      } 
      if (this.loginForm.get('password')?.invalid) {
        this.passMessage = 'Please, enter a password.';
        this.errorPass = true;
      }
      return;
    } else {
      this.submitted = true;
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
            this.loginError = true;
            this.errorMessage = 'Invalid username/email or password.'
            this.status = error;
            this.loginForm.reset();
          }
        });
      }
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

  hasError(controlName: string): boolean {
    const control = this.loginForm.get(controlName);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  getErrorUser(controlName: string): { [key: string]: boolean } {
    const control = this.loginForm.get(controlName);
    const isInvalid = control?.invalid ?? false;
    const shouldShowError = (control?.dirty || control?.touched || this.submitted) && isInvalid;

    if (controlName === 'usernameOrEmail' && control) {
      if (control.dirty && control.hasError('required')) {
        this.userMessage = 'Please, enter a username or email.';
        this.errorUser = true;
      } else {
        this.userMessage = '';
        this.errorUser = false;
      }
    }
    return {
      'border-b-red-300 border-b-2': shouldShowError,
      '': !shouldShowError
    };
  }

  getErrorPass(controlName: string): { [key: string]: boolean } {
    const control = this.loginForm.get(controlName);
    const isInvalid = control?.invalid ?? false;
    const shouldShowError = (control?.dirty || control?.touched || this.submitted) && isInvalid;

    if (controlName === 'password' && control) {
      if (control.dirty && control.hasError('required')) {
        this.passMessage = 'Please, enter a password.';
        this.errorPass = true;
      } else {
        this.passMessage = '';
        this.errorPass = false;
      }
    }
    return {
      'border-b-red-300 border-b-2': shouldShowError,
      '': !shouldShowError
    };
  }
}
