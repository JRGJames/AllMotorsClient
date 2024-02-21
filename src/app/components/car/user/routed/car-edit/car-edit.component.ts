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
  backgroundImage: string = `url(assets/images/image1.jpg)`;
  years: number[] = [];
  brands: string[] = [];
  models: string[] = [];
  users: IUser[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private carService: CarService,
    private userService: UserService,
    private router: Router, // Inyectar Router
    private route: ActivatedRoute // Inyectar ActivatedRoute

  ) { }

  initializeForm(car: ICar) {
    this.carForm = this.formBuilder.group({
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
      currency: [car.currency, [Validators.required]],
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
    this.loadYears();
    this.loadBrands();
    this.loadUsers();
    if (id) {
      this.findCarById(parseInt(id));
    }
  }
  
  loadYears() {
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 1900; year--) {
      this.years.push(year);
    }
  }

  findCarById(id: number) {
  this.carService.get(id).subscribe(
    car => {
      this.car = car;
      this.initializeForm(this.car);

      console.log('Detalles del coche:', this.car);
    },
    error => {
      console.error('Error al obtener los detalles del coche:', error);
    }
  );
}

onSubmit() {
  console.log('Formulario:', this.carForm.value);
  // Comprobar si el formulario es válido antes de hacer algo
  if (this.carForm.valid) {

    // Llama al servicio CarService y usa el método para actualizar el coche
    this.carService.update(this.car).subscribe({
      next: (response) => {
        // La respuesta es el coche actualizado, puedes redirigir al usuario o mostrar un mensaje
        console.log('Coche actualizado:', response);
        // Redirigir al usuario a la página del coche o a la lista de coches, por ejemplo
        // this.router.navigate(['/car', carId]);
        this.router.navigate(['/car', response.id]);
      },
      error: (error) => {
        console.error('Error al actualizar el coche:', error);
        // Manejar el error, mostrar un mensaje al usuario, etc.
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
