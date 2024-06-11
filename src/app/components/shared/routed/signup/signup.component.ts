import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, catchError, map, min, of, switchMap, tap, throwError } from 'rxjs';
import { IUser, formOperation } from 'src/app/model/model';
import { CryptoService } from 'src/app/service/crypto.service';
import { SessionService } from 'src/app/service/session.service';
import { UserService } from 'src/app/service/user.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  @Input() operation: formOperation = 'NEW'; //new or edit

  userForm!: FormGroup;
  user: IUser = {} as IUser;
  status: string | null = null;
  submitted: boolean = false;
  passwordVisible: { [key: string]: boolean } = {
    password: false,
    cpassword: false,
  };
  errorEmail: boolean = false;
  emailMessage: string = '';

  errorUsername: boolean = false;
  usernameMessage: string = '';

  errorPassword: boolean = false;
  passWordMessage: string = '';

  backgroundImage: string = '';

  constructor(
    private fb: FormBuilder,
    private sessionService: SessionService,
    private userService: UserService,
    private router: Router,
    private cryptoService: CryptoService,
  ) {
    this.initializeForm(this.user);
  }

  initializeForm(user: IUser) {
    this.userForm = this.fb.group({
      email: [user.email, [Validators.required, Validators.email]],
      username: [user.username, [Validators.required, Validators.minLength(3), Validators.maxLength(15)]],
      password: [user.password, [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/)]],
      cpassword: ['', [Validators.required, Validators.minLength(8)]],
    }, { validators: this.passwordMatchValidator });
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
    if (this.userForm.invalid || this.errorEmail || this.errorUsername || this.errorPassword) {
      if (this.userForm.get('email')?.invalid || this.errorEmail) {
        this.errorEmail = true;
        this.emailMessage = 'Enter a valid email.';
      }
      if (this.userForm.get('username')?.invalid || this.errorUsername) {
        this.errorUsername = true;
        this.usernameMessage = 'Enter a valid username.';
      }
      if (this.userForm.get('password')?.invalid || this.errorPassword) {
        this.errorPassword = true;
        this.passWordMessage = 'Enter a valid password.';
      }
      return;
    } else {
      this.submitted = true;
      this.userForm.markAllAsTouched();  // Marca todos los controles como tocados

      if (this.userForm.valid && this.operation === 'NEW') {
        const formData = { ...this.userForm.value };
        formData.password = this.cryptoService.getSHA256(formData.password); // Hashea la contraseña directamente
        //delete formData.cpassword; // Elimina la confirmación de la contraseña
        delete formData.cpassword; // Elimina la confirmación de la contraseña

        this.userService.create(formData).pipe(
          switchMap(() => this.sessionService.login(formData.username, formData.password)), // Encadena el inicio de sesión después de la creación
          tap((data: string) => {
            this.sessionService.setToken(data);
            this.sessionService.emit({ type: 'login' });
          }),
          catchError((error: HttpErrorResponse) => {
            this.status = `Error ${error.status}: ${error.message}`;


            return throwError(() => new Error('Error during user creation or login')); // Maneja errores tanto de creación como de inicio de sesión
          })
        ).subscribe({
          next: () => this.router.navigate(['/']),
          error: (error) =>
            console.error('Error:', error) // Manejo de errores

        });
      }
    }

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

  hasError(controlName: string): boolean {
    const control = this.userForm.get(controlName);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  getErrorEmail(controlName: string): { [key: string]: boolean } {
    const control = this.userForm.get(controlName);
    const isInvalid = control?.invalid ?? false;
    const shouldShowError: boolean = (control?.dirty || this.submitted) && isInvalid;

    if (controlName === 'email' && control) {

      if (control.dirty && control.hasError('required')) {
        this.emailMessage = 'Email is required.';
        this.errorEmail = true;
      } else if (control.dirty && control.invalid) {
        this.emailMessage = 'Enter a valid email.';
        this.errorEmail = true;
      } else if (control.dirty && control.valid) {
        this.userService.checkEmailNotTaken(control.value).subscribe(isAvailable => {
          if (!isAvailable) {
            this.emailMessage = 'Email already taken.';
            this.errorEmail = true;
          } else {
            this.emailMessage = '';
            this.errorEmail = false;
          }
        });
      } else {
        this.emailMessage = '';
        this.errorEmail = false;
      }
    }

    return {
      'border-b-red-300 border-b-2': shouldShowError,
      '': !shouldShowError
    };
  }

  getErrorUsername(controlName: string): { [key: string]: boolean } {
    const control = this.userForm.get(controlName);
    const isInvalid = control?.invalid ?? false;
    const shouldShowError: boolean = (control?.dirty || this.submitted) && isInvalid;

    if (controlName === 'username' && control) {
      if (control.dirty && control.hasError('required')) {
        this.usernameMessage = 'Username is required.';
        this.errorUsername = true;
      } else if (control.dirty && control.hasError('minlength')) {
        this.usernameMessage = 'Username must be at least 3 characters long.';
        this.errorUsername = true;
      } else if (control.dirty && control.hasError('maxlength')) {
        this.usernameMessage = 'Username must be at most 15 characters long.';
        this.errorUsername = true;
      } else if (control.dirty && control.valid) {
        this.userService.checkUsernameNotTaken(control.value).subscribe(isAvailable => {
          if (!isAvailable) {
            this.usernameMessage = 'Username already taken.';
            this.errorUsername = true;
          } else {
            this.usernameMessage = '';
            this.errorUsername = false;
          }
        });
      } else if (control.dirty && control.valid) {
        this.usernameMessage = '';
        this.errorUsername = false;
      } else {
        this.usernameMessage = '';
        this.errorUsername = false;
      }
    }

    return {
      'border-b-red-300 border-b-2': shouldShowError,
      '': !shouldShowError
    };
  }

  getErrorPassword(controlName: string): { [key: string]: boolean } {
    const control = this.userForm.get(controlName);
    const isInvalid = control?.invalid ?? false;
    const shouldShowError = (control?.dirty || this.submitted) && isInvalid;

    if (controlName === 'password' && control) {
      if (control.dirty && control.hasError('required')) {
        this.passWordMessage = 'Password is required.';
        this.errorPassword = true;
      } else if (control.dirty && control.hasError('minlength')) {
        this.passWordMessage = 'Password must be at least 8 characters long.';
        this.errorPassword = true;
      } else if (control.dirty && control.hasError('pattern')) {
        this.passWordMessage = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one symbol.';
        this.errorPassword = true;
      } else if (control.valid) {
        this.passWordMessage = '';
        this.errorPassword = false;
      } else {
        this.passWordMessage = '';
        this.errorPassword = false;
      }
    }

    return {
      'border-b-red-300 border-b-2': shouldShowError,
      '': !shouldShowError
    };
  }
}
