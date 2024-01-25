import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CryptoService } from 'src/app/service/crypto.service';
import { SessionService } from 'src/app/service/session.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  loginForm: FormGroup;
  status: HttpErrorResponse | null = null;
  passwordVisible: { [key: string]: boolean } = {
    password: false,
    cpassword: false,
  };
  
  
  backgroundImage: string = '';

  constructor(
    private fb: FormBuilder,
    private sessionService: SessionService,
    private router: Router,
    private cryptoService: CryptoService,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      cpassword: ['', [Validators.required, Validators.minLength(8)]],
    }, { validators: this.passwordMatchValidator });
    
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
      const username = this.loginForm.value.username;
      const email = this.loginForm.value.email;
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

  onReset() {
    this.loginForm.reset();
  }

  onRegister() {
    this.router.navigate(['/user/user/new']);
  }

  togglePasswordVisibility(field: string) {
    this.passwordVisible[field] = !this.passwordVisible[field];
  }

  getPasswordInputType(field: string) {
    return this.passwordVisible[field] ? 'text' : 'password';
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const cpassword = form.get('cpassword')?.value;
  
    return password === cpassword ? null : { passwordMismatch: true };
  }
  
}

