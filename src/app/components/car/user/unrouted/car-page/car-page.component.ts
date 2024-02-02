import { Component, Input, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ICar, ICarPage, IUser } from 'src/app/model/model';
import { CarService } from 'src/app/service/car.service';
import { Subject } from 'rxjs';
import { UserService } from 'src/app/service/user.service';

@Component({
  selector: 'app-car-page',
  templateUrl: './car-page.component.html',
  styleUrls: ['./car-page.component.css']
})
export class CarPageComponent implements OnInit {
  @Input() forceReload: Subject<boolean> = new Subject<boolean>();
  @Input() id_user: number = 0; //filter by user

  page: ICarPage | undefined;
  owner: IUser | null = null; // data of user if id_user is set for filter
  orderField: string = "id";
  orderDirection: string = "asc";
  status: HttpErrorResponse | null = null;
  carToRemove: ICar | null = null;

  constructor(
    private userService: UserService,
    private carService: CarService,
  ) { }

  ngOnInit() {
    this.getPage();
    if (this.id_user > 0) {
      this.getUser();
    }
    this.forceReload.subscribe({
      next: (v) => {
        if (v) {
          this.getPage();
        }
      }
    });
  }

  getPage(): void {
    this.oCarService.getPage(this.oPaginatorState.rows, this.oPaginatorState.page, this.orderField, this.orderDirection, this.id_user).subscribe({
      next: (data: ICarPage) => {
        this.oPage = data;
        this.oPaginatorState.pageCount = data.totalPages;
      },
      error: (error: HttpErrorResponse) => {
        this.status = error;
      }
    })
  }

  onPageChang(event: PaginatorState) {
    this.oPaginatorState.rows = event.rows;
    this.oPaginatorState.page = event.page;
    this.getPage();
  }

  doOrder(fieldorder: string) {
    this.orderField = fieldorder;
    if (this.orderDirection == "asc") {
      this.orderDirection = "desc";
    } else {
      this.orderDirection = "asc";
    }
    this.getPage();
  }
  getValue(event: any): string {
    return event.target.value;
  }
  search(filterValue: string): void {

    if (filterValue.length >= 3) {
      
      this.oCarService.getPage(this.oPaginatorState.rows, this.oPaginatorState.first, 'id', 'asc', this.id_user,filterValue)
        .pipe(
          debounceTime(500),
          switchMap((data: ICarPage) => {
            return of(data);
          })
        )
        .subscribe(
          (data: ICarPage) => {
            this.oPage = data;
          },
          (error: any) => {
            // Handle error
            console.error(error);
          }
        );
    } else {
      // If filterValue is null or less than 3 characters, load all users without debounce
      this.oCarService.getPage(this.oPaginatorState.rows, this.oPaginatorState.first, 'id', 'asc', this.id_user)
        .subscribe(
          (data: ICarPage) => {
            this.oPage = data;
          },
          (error: any) => {
            // Handle error
            console.error(error);
          }
        );
    }
  }
  doView(u: IThread) {
    this.ref = this.oDialogService.open(AdminThreadDetailUnroutedComponent, {
      data: {
        id: u.id
      },
      header: this.oTranslocoService.translate('global.view') + ' ' + this.oTranslocoService.translate('thread.lowercase.singular'),
      width: '50%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: false
    });
  }

  doRemove(u: IThread) {
    this.carToRemove = u;
    this.oCconfirmationService.confirm({
      accept: () => {
        this.oMatSnackBar.open(this.oTranslocoService.translate('global.the.masc') + ' ' + this.oTranslocoService.translate('thread.lowercase.singular') + ' ' + this.oTranslocoService.translate('global.remove.has.masc'), '', { duration: 2000 });
        this.oCarService.removeOne(this.carToRemove?.id).subscribe({
          next: () => {
            this.getPage();
          },
          error: (error: HttpErrorResponse) => {
            this.status = error;
            this.oMatSnackBar.open(this.oTranslocoService.translate('global.the.masc') + ' ' + this.oTranslocoService.translate('thread.lowercase.singular') + ' ' + this.oTranslocoService.translate('global.remove.hasnt.masc'), "", { duration: 2000 });
          }
        });
      },
      reject: (type: ConfirmEventType) => {
        this.oMatSnackBar.open(this.oTranslocoService.translate('global.the.masc') + ' ' + this.oTranslocoService.translate('thread.lowercase.singular') + ' ' + this.oTranslocoService.translate('global.remove.hasnt.masc'), "", { duration: 2000 });
      }
    });
  }

  getUser(): void {
    this.userService.getOne(this.id_user).subscribe({
      next: (data: IUser) => {
        this.owner = data;
      },
      error: (error: HttpErrorResponse) => {
        this.status = error;
      }

    })
  }

}