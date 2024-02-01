import { Component, OnInit, OnDestroy } from '@angular/core';
import { CarService } from 'src/app/service/car.service';
import { ICar } from 'src/app/model/model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  popularCars: ICar[] = [];
  currentPage: number = 1;
  private autoChangePage: any;

  constructor(private carService: CarService) {}

  ngOnInit() {
    this.loadPopularCars();
    this.startAutoChangePage();
  }

  ngOnDestroy() {
    // Limpiar el intervalo cuando el componente se destruye para evitar fugas de memoria
    if (this.autoChangePage) {
      clearInterval(this.autoChangePage);
    }
  }

  loadPopularCars() {
    const amount = 5; // Cantidad de coches más visitados que deseas mostrar
    this.carService.byViews(amount).subscribe({
      next: (data: ICar[]) => {
        this.popularCars = data;
        console.log(this.popularCars);  // Verificar los datos recibidos
      },
      error: (error) => {
        console.error('Error al cargar coches populares:', error);
      }
    });
  }
  
  startAutoChangePage() {
    this.autoChangePage = setInterval(() => {
      this.nextPage();
    }, 15000); // Cambia la página cada 15 segundos
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    } else {
      this.currentPage = this.popularCars.length;
    }
    this.resetAutoChangePage(); // Reiniciar el contador automático
  }

  nextPage() {
    if (this.currentPage < this.popularCars.length) {
      this.currentPage++;
    } else {
      this.currentPage = 1;
    }
    this.resetAutoChangePage(); // Reiniciar el contador automático
  }

  resetAutoChangePage() {
    // Limpiar el intervalo anterior
    if (this.autoChangePage) {
      clearInterval(this.autoChangePage);
    }
    // Iniciar un nuevo intervalo
    this.startAutoChangePage();
  }

  changePage(newPage: number) {
    this.currentPage = newPage;
    this.resetAutoChangePage(); // Reinicia el intervalo automático para que comience desde la nueva imagen seleccionada
  }
  
}
