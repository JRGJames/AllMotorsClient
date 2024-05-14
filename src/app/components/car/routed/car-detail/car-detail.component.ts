import { UserService } from '../../../../service/user.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ICar, IUser } from 'src/app/model/model';
import { CarService } from 'src/app/service/car.service';
import { RatingService } from 'src/app/service/rating.service';
import { SessionService } from 'src/app/service/session.service';
import { API_URL } from 'src/environment/environment';
import { ChartComponent, ApexAxisChartSeries, ApexChart, ApexXAxis, ApexTitleSubtitle, ApexYAxis, ApexStroke, ApexMarkers, ApexFill, ApexTooltip, ApexDataLabels } from "ng-apexcharts";
import { SavedService } from 'src/app/service/saved.service';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  stroke: ApexStroke;
  fill: ApexFill;
  dataLabels: ApexDataLabels
  markers: ApexMarkers;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  tooltip: ApexTooltip;
  title: ApexTitleSubtitle;
};

@Component({
  selector: 'app-car-detail',
  templateUrl: './car-detail.component.html',
  styleUrls: ['./car-detail.component.css'],
})
export class CarDetailComponent implements OnInit {
  @ViewChild('userList') userList!: ElementRef;
  @ViewChild('colorPicker') colorPicker!: ElementRef;

  url = API_URL;
  urlPicture: string = API_URL + "/media/";
  showPhoneNumber: boolean = false;
  id!: number;
  imageIndex: number = 0;
  averageRating: number = 0;
  ratingCount: number = 0;
  car: ICar = { owner: {} } as ICar;
  status: HttpErrorResponse | null = null;
  currentUser: IUser = {} as IUser;
  isDeleteModalVisible: boolean = false;
  idToDelete: number | null = null;
  setContentEditable: boolean = false;
  users: IUser[] = [];
  isEditingOwner: boolean = false;
  selectedUser: string = "";
  isEditingColor: boolean = false;
  isEditingFuel: boolean = false;
  isEditingGearbox: boolean = false;

  colors: { color: string, hex: string }[] = [
    { color: 'black', hex: '#1F2937' },
    { color: 'maroon', hex: '#800000' },
    { color: 'brown', hex: '#A52A2A' },
    { color: 'red', hex: '#D92518' },
    { color: 'orange', hex: '#FFA500' },
    { color: 'yellow', hex: '#FFC107' },
    { color: 'olive', hex: '#808000' },
    { color: 'lime', hex: '#00FF00' },
    { color: 'green', hex: '#2ECC71' },
    { color: 'teal', hex: '#008080' },
    { color: 'cyan', hex: '#00FFFF' },
    { color: 'blue', hex: '#0284C7' },
    { color: 'navy', hex: '#000080' },
    { color: 'indigo', hex: '#4B0082' },
    { color: 'purple', hex: '#800080' },
    { color: 'magenta', hex: '#FF00FF' },
    { color: 'pink', hex: '#FFC0CB' },
    { color: 'grey', hex: '#8C8C8C' },
    { color: 'silver', hex: '#C0C0C0' },
    { color: 'white', hex: '#FFFFFF' }
  ];
  fuelTypes: string[] = ['gasoline', 'diesel', 'hybrid', 'electric'];
  gearboxTypes: string[] = ['manual', 'automatic'];
  chartOptions: Partial<ChartOptions> = {
    series: [
      {
        name: "Price",
        data: [20, 15, 5, 16],
        color: "#0284C7"
      }
    ],
    chart: {
      height: 300,
      type: "area",
      zoom: {
        enabled: false
      },
      toolbar: {
        show: false
      }
    },
    title: {
      text: "Price history",
      align: "left",
      style: {
        fontSize: '20px',
        fontWeight: 'bold',
        fontFamily: 'sans-serif',
        color: '#1F2937'
      },

    },
    stroke: {
      curve: "smooth"
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 1,
        opacityTo: 0.8,
      }
    },
    markers: {
      size: 6
    },
    yaxis: {
      min: 0,
      title: {
        rotate: 360,
        offsetY: 0,
        style: {
          fontSize: '16px',
          fontWeight: 'bold',
          fontFamily: 'sans-serif',
          color: '#1F2937'
        }
      },
      stepSize: 10,
      tooltip: {
        enabled: false
      }
    },
    xaxis: {
      categories: ["1", "2", "3", "4"],
      tooltip: {
        enabled: false
      },
      title: {
        text: "Months",
        style: {
          fontSize: '16px',
          fontWeight: 'bold',
          fontFamily: 'sans-serif',
          color: '#1F2937'
        }
      }
    },
    tooltip: {
      enabled: true,
      x: {
        show: false
      },

      y: {
        formatter: function (value: number) {
          return value + "€";
        }
      }
    },
    dataLabels: {
      enabled: false
    }
  };
  chart: ChartComponent = Object.create(this.chartOptions);

  constructor(
    private carService: CarService,
    private sessionService: SessionService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private ratingService: RatingService,
    private savedService: SavedService,
    private elementRef: ElementRef

  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.id = +params['id'];
      if (this.id) {
        this.getCurrentUser();
        this.getOne();
      } else {
        console.error('ID is undefined');
      }
    });
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

  getOne(): void {
    this.carService.get(this.id).subscribe({
      next: (data: ICar) => {
        this.car = data;
        this.getRatingCount(this.car.owner.id);
        this.getRatingAverage(this.car.owner.id);
        this.checkIfCarIsSaved(this.car.id);
        this.increaseViews(this.car.id);
        this.selectedUser = this.car.owner.username;

      },
      error: (error: HttpErrorResponse) => {
        this.status = error;
      }
    });
  }

  prevImage() {
    this.imageIndex--;
  }

  nextImage() {
    this.imageIndex++;
  }

  changePage(newPage: number) {
    this.imageIndex = newPage;
  }

  togglePhoneNumber(): void {
    this.showPhoneNumber = !this.showPhoneNumber;
  }

  getRatingCount(ownerId: number): void {
    this.ratingService.getUserRatingCount(ownerId).subscribe({
      next: (ratingCount) => {
        this.ratingCount = ratingCount;
      },
      error: (error) => {
        console.error('Error al obtener la cantidad de valoraciones', error);
      },
    });
  }

  getRatingAverage(ownerId: number): void {
    this.ratingService.getUserAverageRating(ownerId).subscribe({
      next: (averageRating) => {
        this.averageRating = averageRating;
      },
      error: (error) => {
        console.error('Error al obtener la valoración media', error);
      },
    });
  }

  increaseViews(carId: number): void {
    this.carService.increaseViews(carId).subscribe({
      error: (error) => {
        console.error('Error increasing views', error);
      },
    })
  }

  handleFavorites(car: ICar): void {
    if (this.sessionService.isSessionActive()) {
      this.savedService.isSaved(this.currentUser.id, car.id).subscribe({
        next: (response: boolean) => {
          if (response) {
            this.removeFromSaved(car.id);
            this.decreaseSaves(car.id);
          } else {
            this.addToSaved(car.id);
            this.increaseSaves(car.id);
          }
        }
      });
    } else {
      this.router.navigate(['/login']);
    }
  }

  addToSaved(carId: number): void {
    const saveBtn = document.querySelectorAll(`button[data-car-id="${carId}"]`);

    this.savedService.addToSaved(this.currentUser.id, carId).subscribe({
      next: () => {
        console.log('Coche añadido a favoritos: +', carId);
        saveBtn.forEach((btn) => {
          if (btn) {
            btn.classList.remove('text-gray-800', 'hover:text-yellow-500');
            btn.classList.add('text-yellow-500', 'hover:text-yellow-600');
          }
        });
      },
      error: (error: string) => {
        console.error('Error al añadir coche a favoritos:', error);
      },
    });
  }

  removeFromSaved(carId: number): void {
    const saveBtn = document.querySelectorAll(`button[data-car-id="${carId}"]`);

    this.savedService.removeFromSaved(this.currentUser.id, carId).subscribe({
      next: () => {
        console.log('Coche eliminado de favoritos: -', carId);
        saveBtn.forEach((btn) => {
          if (btn) {
            btn.classList.remove('text-yellow-500', 'hover:text-yellow-600');
            btn.classList.add('text-gray-800', 'hover:text-yellow-500');
          }
        });
      },
      error: (error: string) => {
        console.error('Error al eliminar coche de favoritos:', error);
      },
    });
  }

  increaseSaves(carId: number): void {
    this.savedService.increaseSaves(carId).subscribe({
      next: () => {
      },
      error: (error: string) => {
        console.error('Error al aumentar el contador de favoritos:', error);
      },
    });
  }

  decreaseSaves(carId: number): void {
    this.savedService.decreaseSaves(carId).subscribe({
      next: () => {
      },
      error: (error: string) => {
        console.error('Error al disminuir el contador de favoritos:', error);
      },
    });
  }

  checkIfCarIsSaved(carId: number): void {
    if (this.sessionService.isSessionActive()) {
      this.savedService.isSaved(this.currentUser.id, carId).subscribe({
        next: (response: boolean) => {
          const saveBtn = document.querySelectorAll(`button[data-car-id="${carId}"]`);

          if (response) {
            saveBtn.forEach((btn) => {
              if (btn) {
                btn.classList.remove('text-gray-800', 'hover:text-yellow-500');
                btn.classList.add('text-yellow-500', 'hover:text-yellow-600');
              }
            });
          } else {
            saveBtn.forEach((btn) => {
              if (btn) {
                btn.classList.remove('text-yellow-500', 'hover:text-yellow-600');
                btn.classList.add('text-gray-800', 'hover:text-yellow-500');
              }
            });
          }
        },
        error: (error: string) => {
          console.error('Error al comprobar si el coche está en favoritos:', error);
        },
      });
    }
  }

  isCurrentUserOwner(selectedCar: ICar): boolean {
    return selectedCar.owner.id === this.currentUser.id || this.currentUser.role === true;
  }

  openDeleteModal(id: number): void {
    this.idToDelete = id;
    this.isDeleteModalVisible = true;
  }

  closeDeleteModal(): void {
    this.isDeleteModalVisible = false;
    this.idToDelete = null;
  }

  // Función para manejar la eliminación
  deleteCar(): void {
    if (this.idToDelete) {
      this.carService.remove(this.idToDelete).subscribe({
        next: () => {
          this.closeDeleteModal();
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('Error deleting the car', error);
          this.closeDeleteModal();
        }
      });
    }
  }

  setEditable(): void {
    const editables = document.querySelectorAll('.editable');

    this.loadUsers();
    if (this.setContentEditable) {
      this.isEditingFuel = false;
      this.isEditingOwner = false;
      this.isEditingColor = false;
      this.isEditingGearbox = false;

      // Actualizamos los datos del usuario
      this.car.title = document.getElementById('title')?.innerText || '';
      this.car.brand = document.getElementById('brand')?.innerText?.toLowerCase() || '';
      this.car.model = document.getElementById('model')?.innerText?.toLowerCase() || '';
      const priceText = document.getElementById('price')?.innerText || '';
      this.car.price = Number(priceText.replace('.', ''));

      this.car.year = Number(document.getElementById('year')?.innerText);

      this.car.seats = Number(document.getElementById('seats')?.innerText);
      this.car.doors = Number(document.getElementById('doors')?.innerText);
      this.car.description = document.getElementById('description')?.innerText || '';

      const distanceText = document.getElementById('distance')?.innerText || '';
      this.car.distance = Number(distanceText.replace('.', ''));
      this.car.type = document.getElementById('type')?.innerText?.toLowerCase() || '';
      const horsepowerText = document.getElementById('horsepower')?.innerText || '';
      this.car.horsepower = Number(horsepowerText.replace('.', ''));
      // this.car.lastITV = new Date(document.getElementById('lastITV')?.textContent || '');
      this.car.consumption = Number(document.getElementById('consumption')?.innerText);
      this.car.emissions = Number(document.getElementById('emissions')?.innerText);
      this.car.acceleration = Number(document.getElementById('acceleration')?.innerText);
      this.car.lastUpdate = new Date();

      this.carService.update(this.car).subscribe({
        next: (car: ICar) => {
          this.car = car;
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error al actualizar los datos del coche:', error);
        }
      });

    } else {
      console.error('Aun no se ha actualizado la información');
    }

    this.setContentEditable = !this.setContentEditable;


    editables.forEach((editable) => {
      if (this.setContentEditable) {
        editable.setAttribute('contenteditable', 'true');
      } else {
        editable.setAttribute('contenteditable', 'false');
      }
    });
  }

  loadUsers(): void {
    this.userService.getAll().subscribe({
      next: (users: IUser[]) => {
        this.users = users;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error al cargar los usuarios:', error);
      }
    });
  }

  selectUser(userId: number): void {
    this.car.owner.id = userId;
    this.isEditingOwner = !this.isEditingOwner;
    this.userService.get(userId).subscribe({
      next: (user: IUser) => {
        this.selectedUser = user.username;
      }
    });
  }

  selectColor(color: string): void {
    this.car.color = color;
    this.isEditingColor = !this.isEditingColor;
  }


  // @HostListener('document:click', ['$event'])
  // onClickOutside(event: Event) {
  //   const clickedElement = event.target as HTMLElement;

  //   if ((clickedElement.contains(this.userList.nativeElement)) || (clickedElement.contains(this.colorPicker.nativeElement))) {
  //     this.isEditingOwner = false;
  //     this.isEditingColor = false;
  //   }
  // }

  getUserInitials(user: IUser): string {
    if (user.name && user.lastname) {
      return `${user.name.charAt(0)}${user.lastname.charAt(0)}`.toUpperCase();
    }
    return '';
  }
}
