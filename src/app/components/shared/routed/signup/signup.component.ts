import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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
      email: [user.email, [Validators.required, Validators.email]],
      username: [user.username, [Validators.required]],
      password: [user.password, [Validators.required, Validators.minLength(8)]],
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
    this.submitted = true;
  
    if (this.userForm.valid) {
      if (this.operation === 'NEW') {
        const formData = {...this.userForm.value}; 
        const plainPassword = formData.password; // Guarda la contraseña en texto plano
        formData.password = this.cryptoService.getSHA256(formData.password); // Hashea la contraseña para la creación del usuario
  
        this.userService.create(formData).subscribe({
          next: (user: IUser) => {
            // Usuario creado exitosamente, ahora inicia sesión automáticamente
            this.sessionService.login(user.username, this.cryptoService.getSHA256(this.cryptoService.getSHA256(formData.password))).subscribe({
              next: (token: string) => {
                this.sessionService.setToken(token); // Guarda el token JWT en el almacenamiento local o en el servicio
                this.router.navigate(['/']); // Redirige al usuario al home
              },
              error: (loginError: HttpErrorResponse) => {
                console.error('Error al iniciar sesión automáticamente', loginError);
                // Manejo de errores de inicio de sesión, si es necesario
              }
            });
          },
          error: (createError: HttpErrorResponse) => {
            this.status = createError;
            console.error('Error al crear usuario', createError);
            // Manejo de errores de creación de usuario, si es necesario
          }
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

  getErrorClasses(controlName: string): { [key: string]: boolean } {
    return {
      'border-b-red-300 border-b-2': this.submitted && this.hasError(controlName)
    };
  }

}

