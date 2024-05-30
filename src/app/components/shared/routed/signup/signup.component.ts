import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, switchMap, tap, throwError } from 'rxjs';
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
  status: HttpErrorResponse | null = null;
  submitted: boolean = false;
  passwordVisible: { [key: string]: boolean } = {
    password: false,
    cpassword: false,
  };


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
      email: [user.email, [Validators.required, Validators.email], [this.uniqueEmailValidator(this.userService)]],
      username: [user.username, [Validators.required], [this.uniqueEmailValidator(this.userService)]],
      password: [user.password, [Validators.required, Validators.minLength(8)]],
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
    this.submitted = true;
    this.userForm.markAllAsTouched();  // Marca todos los controles como tocados
  
    if (this.userForm.valid && this.operation === 'NEW') {
      const formData = { ...this.userForm.value };
      formData.password = this.cryptoService.getSHA256(formData.password); // Hashea la contraseña directamente
  
      this.userService.create(formData).pipe(
        switchMap(() => this.sessionService.login(formData.username, formData.password)), // Encadena el inicio de sesión después de la creación
        tap((data: string) => {
          this.sessionService.setToken(data);
          this.sessionService.emit({ type: 'login' });
        }),
        catchError((error: HttpErrorResponse) => {
          this.status = error;
          return throwError(() => new Error('Error during user creation or login')); // Maneja errores tanto de creación como de inicio de sesión
        })
      ).subscribe({
        next: () => this.router.navigate(['/']),
        error: (error) => console.error('Error:', error) // Manejo de errores
      });
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

  getErrorClasses(controlName: string): { [key: string]: boolean } {
    const control = this.userForm.get(controlName);
    const isInvalid = control?.invalid ?? false;
    const shouldShowError = (control?.dirty || control?.touched || this.submitted) && isInvalid;

    return {
      'border-b-red-300 border-b-2': shouldShowError,
      '': !shouldShowError
    };
  }

  uniqueUsernameValidator(userService: UserService): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      return userService.checkUsernameNotTaken(control.value).pipe(
        map(isUsernameAvailable => {
          if (!isUsernameAvailable) {
            console.log('El nombre de usuario ya está en uso.');
            return { usernameTaken: true };
          }
          return null;
        }),
        catchError(() => {
          console.log('Error al comprobar el nombre de usuario.');
          return of(null);
        })
      );
    };
  }
  
  // Validador para el correo electrónico
  uniqueEmailValidator(userService: UserService): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      return userService.checkEmailNotTaken(control.value).pipe(
        map(isEmailAvailable => {
          if (!isEmailAvailable) {
            console.log('El correo electrónico ya está en uso.');
            return { emailTaken: true };
          }
          return null;
        }),
        catchError(() => {
          console.log('Error al comprobar el correo electrónico.');
          return of(null);
        })
      );
    };
  }

}

