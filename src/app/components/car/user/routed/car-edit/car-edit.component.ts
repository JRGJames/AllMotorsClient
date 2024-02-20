import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ICar, IImage } from 'src/app/model/model';
import { CarService } from 'src/app/service/car.service';

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


  constructor(
    private formBuilder: FormBuilder,
    private carService: CarService,
    private route: ActivatedRoute // Inyectar ActivatedRoute

  ) { }

  initializeForm(car: ICar) {
    this.carForm = this.formBuilder.group({
      brand: [car.brand, Validators.required],
      model: [car.model, Validators.required],
      title: [car.title, Validators.required],
      images: [car.images],
      color: [car.color, Validators.required],
      year: [car.year, Validators.required],
      seats: [car.seats, Validators.required],
      doors: [car.doors, Validators.required],
      horsepower: [car.horsepower],
      gearbox: [car.gearbox, Validators.required],
      distance: [car.distance, Validators.required],
      fuel: [car.fuel, Validators.required],
      price: [car.price, Validators.required],
      type: [car.type],
      location: [car.location, Validators.required],
      boughtIn: [car.boughtIn],
      currency: [car.currency, Validators.required],
      emissions: [car.emissions],
      consumption: [car.consumption],
      acceleration: [car.acceleration],
      engine: [car.engine],
      drive: [car.drive],
      plate: [car.plate],
      dgtSticker: [car.dgtSticker],
      lastITV: [car.lastITV],
      description: [car.description],
      owner: this.formBuilder.group({
        id: [car.owner.id, Validators.required]
      })
    });
  }

  
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.findCarById(parseInt(id));
    }
  }
  
  findCarById(id: number) {
    this.carService.get(id).subscribe(
      car => {
        this.car = car;
        this.initializeForm(this.car);
      }
    );
  }

  onSubmit() {
    
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
