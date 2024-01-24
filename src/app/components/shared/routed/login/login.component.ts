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

  constructor(
    private fb: FormBuilder,
    private sessionService: SessionService,
    private router: Router,
    private cryptoService: CryptoService,
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  ngOnInit() {
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const username = this.loginForm.value.username;
      const hashedPassword = this.cryptoService.getSHA256(this.loginForm.value.password);

      this.sessionService.login(username, hashedPassword).subscribe({
        next: (data: string) => {
          this.sessionService.setToken(data);
          this.sessionService.emit({ type: 'login' });
          this.router.navigate(['/home']);
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

  loginAdmin() {
    this.loginForm.setValue({
      username: 'ElNano',
      password: '33',
    })
  }

  loginUser() {
    this.loginForm.setValue({
      username: 'carlossainz',
      password: '33',
    })
  }

}
