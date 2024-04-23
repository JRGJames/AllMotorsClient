import { SessionService } from './../../../../service/session.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ICar, IImage, IUser, IUserPage } from 'src/app/model/model';
import { CarService } from 'src/app/service/car.service';
import { UserService } from 'src/app/service/user.service';



@Component({
  selector: 'app-car-edit',
  templateUrl: './car-edit.component.html',
  styleUrls: ['./car-edit.component.css']
})
export class CarEditComponent implements OnInit {

  title: string = '';
  carForm!: FormGroup;
  selectedFiles: File[] = []; // Este array solo contendrá objetos File
  images: IImage[] = [];
  car: ICar = { owner: { id: 0 } } as ICar;
  status: HttpErrorResponse | null = null;
  currentUser: IUser = {} as IUser;
  selectedUser: IUser = {} as IUser;
  selectedBrand: string = '';
  backgroundImage: string = `url(assets/images/image1.webp)`;
  years: number[] = [];
  brands: string[] = [];
  models: string[] = [];
  users: IUser[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private carService: CarService,
    private userService: UserService,
    private sessionService: SessionService,
    private router: Router, // Inyectar Router
    private route: ActivatedRoute // Inyectar ActivatedRoute

  ) { }

  initializeForm(car: ICar) {
    this.carForm = this.formBuilder.group({
      id: [car.id, [Validators.required]],
      brand: [car.brand, [Validators.required]],
      model: [car.model, [Validators.required]],
      title: [car.title, [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
      images: [car.images], // La validación de archivos puede requerir un enfoque personalizado
      color: [car.color, [Validators.required]],
      year: [car.year, [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear())]],
      seats: [car.seats, [Validators.required, Validators.min(1), Validators.max(8)]],
      doors: [car.doors, [Validators.required, Validators.min(1), Validators.max(5)]],
      horsepower: [car.horsepower, [Validators.min(10)]],
      gearbox: [car.gearbox, [Validators.required]],
      distance: [car.distance, [Validators.required]],
      fuel: [car.fuel, [Validators.required]],
      price: [car.price, [Validators.required, Validators.min(1)]],
      type: [car.type],
      location: [car.location, [Validators.required]],
      boughtIn: [car.boughtIn],
      currency: [car.currency, [Validators.required, Validators.pattern(/^[\u0024\u20AC\u00A3\u00A5]+$/)]],
      emissions: [car.emissions, [Validators.min(0)]],
      consumption: [car.consumption, [Validators.min(0)]],
      acceleration: [car.acceleration, [Validators.min(0)]],
      engine: [car.engine],
      drive: [car.drive],
      plate: [car.plate],
      dgtSticker: [car.dgtSticker],
      lastITV: [car.lastITV],
      description: [car.description],
      owner: this.formBuilder.group({
        id: [car.owner.id, [Validators.required]]
      })
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.getCurrentUser();
    this.loadYears();
    this.loadBrands();
    this.loadUsers();
    if (id) {
      this.findCarById(parseInt(id));
    }
  }

  getCurrentUser(): void {
    if (this.sessionService.isSessionActive()) {
      const username = this.sessionService.getUsername();
      this.userService.getByUsername(username).subscribe({
        next: (user: IUser) => {
          this.currentUser = user;
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error al cargar los datos del usuario actual:', error);
        }
      });
    }
  }

  loadYears() {
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 1900; year--) {
      this.years.push(year);
    }
  }

  findCarById(id: number) {
    this.carService.get(id).subscribe({
      next: (data: ICar) => {
        this.car = data;
        this.car.id = id; // Añadir el id al objeto car
        this.title = this.car.title;
        this.initializeForm(this.car);
        this.selectedBrand = this.car.brand;
        this.carService.getBrands().subscribe({
          next: (response) => {
            for (let i = 0; i < response.data.length; i++) {
              this.brands.push(response.data[i].name);
            }
          },
          error: (error) => {
            console.error(error);
          }
        });
        this.models = [this.car.model];
        this.carService.getModelsByBrand(this.car.brand).subscribe({
          next: (response) => {
            for (let i = 0; i < response.data.length; i++) {
              this.models.push(response.data[i].name);
            }
          },
          error: (error) => {
            console.error('Error al cargar modelos:', error);
          }
        });

      },
      error: (error: HttpErrorResponse) => {
        console.error('Error al cargar el coche:', error);
      }
    });
  }

  resetTitle(event: any) {
    this.title = event.target.value;
    this.carForm.patchValue({ title: this.title });
  }

  getUserId(event: any) {
    const selectedUserId = event.target.value;
    this.selectedUser = this.users.find(user => user.id === parseInt(selectedUserId)) || {} as IUser;
    this.carForm.patchValue({ owner: { id: this.selectedUser.id } });
    console.log('Usuario seleccionado:', this.selectedUser);
  }

  onSubmit() {
    console.log('Formulario:', this.carForm.value);
    // Comprobar si el formulario es válido antes de hacer algo
    if (this.carForm.valid) {
      // Llama al servicio CarService y usa el método para actualizar el coche
      console.log('Formulario válido:', this.carForm.value);
      this.carService.update(this.carForm.value).subscribe({
        next: (data: ICar) => {
          this.car = data;
          this.initializeForm(this.car);
          this.router.navigate(['/car', this.car.id]);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error al actualizar el coche:', error);
        }
      });
    } else {
      // Si el formulario no es válido, puedes mostrar un mensaje o marcar los campos inválidos
      console.error('El formulario no es válido');
    }
  }

  loadUsers() {
    const pageSize = 1000; // Ajusta según el máximo esperado de usuarios o el límite de tu backend
    this.userService.getPage(0, pageSize, 'id', 'asc').subscribe({
      next: (response: IUserPage) => {
        this.users = response.content; // Asumiendo que la respuesta tiene una propiedad 'content' con los usuarios
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
      }
    });
  }

  changeTitleBrand(event: any) {
    this.title = event.target.value;
  }

  changeTitleModel(event: any) {
    this.title += ' ' + event.target.value;
    this.carForm.patchValue({ title: this.title });
  }

  setGearbox(gearboxType: string) {
    this.carForm.patchValue({
      gearbox: gearboxType
    });
  }

  setFuel(fuelType: string) {
    this.carForm.patchValue({
      fuel: fuelType
    });
  }

  loadBrands() {
    this.carService.getBrands().subscribe({
      next: (response) => {
        for (let i = 0; i < response.data.length; i++) {
          this.brands.push(response.data[i].name);
        }
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  onBrandChange(event: any) {
    const selectedBrand = event.target.value;
    this.models = [];

    this.carService.getModelsByBrand(selectedBrand).subscribe({
      next: (response) => {
        for (let i = 0; i < response.data.length; i++) {
          this.models.push(response.data[i].name);
        }
      },
      error: (error) => {
        console.error('Error al cargar modelos:', error);
      }
    });
  }

  handleFileInput(event: any) {
    const files: FileList = event.target.files;

    // Llenamos selectedFiles con objetos File
    this.selectedFiles = Array.from(files);

    // Creamos el array de IImage basado en los archivos seleccionados
    this.images = this.selectedFiles.map(file => ({
      imageUrl: file.name, // Usamos el nombre del archivo para imageUrl
      car: this.car // Ponemos el valor de car como null
    }));

    console.log('Imagenes seleccionadas:', this.selectedFiles);
    console.log('Imagenes para IImage:', this.images);
  }

}
