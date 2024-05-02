import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { catchError, concatMap } from 'rxjs';
import { IUser, SessionEvent } from 'src/app/model/model';
import { SessionService } from 'src/app/service/session.service';
import { UserService } from 'src/app/service/user.service';
import { API_URL } from 'src/environment/environment';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  @ViewChild('dropdownButton') dropdownButton!: ElementRef;
  @ViewChild('dropdownContainer') dropdownContainer!: ElementRef;
  @ViewChild('menuButton') menuButton!: ElementRef;
  @ViewChild('menuContainer') menuContainer!: ElementRef;
  @ViewChild('accountDropdownButton') accountDropdownButton!: ElementRef;
  @ViewChild('accountDropdownContainer') accountDropdownContainer!: ElementRef;

  strUserName: string = "";
  sessionUser: IUser = {} as IUser;
  strUrl: string = "";
  showDropdown: boolean = false;
  showMenu: boolean = false;
  showAccountDropdown: boolean = false;
  url = API_URL + "/media/";


  constructor(
    private sessionService: SessionService,
    private userService: UserService,
    public router: Router,
  ) {

    this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationEnd) {
        this.strUrl = ev.url;
      }
    })

    this.strUserName = sessionService.getUsername();
    this.userService.getByUsername(this.sessionService.getUsername()).subscribe({
      next: (user: IUser) => {
        this.sessionUser = user;
      },
      error: (error: HttpErrorResponse) => {
        console.log(error);
      }
    });
  }

  ngOnInit() {
    this.sessionService.on().subscribe({
      next: (data: SessionEvent) => {
        if (data.type == 'login') {
          this.strUserName = this.sessionService.getUsername();
          this.userService.getByUsername(this.sessionService.getUsername()).subscribe({
            next: (user: IUser) => {
              this.sessionUser = user;
            },
            error: (error: HttpErrorResponse) => {
              console.log(error);
            }
          });
        }
        if (data.type == 'logout') {
          this.strUserName = "";
        }
      }
    });
  }

  toggleMenu() {
    this.showMenu = !this.showMenu;
    this.showAccountDropdown = false;
  }

  toggleAccountDropdown() {
    this.showAccountDropdown = !this.showAccountDropdown;
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const clickedElement = event.target as HTMLElement;

    if (
      (clickedElement && this.dropdownButton && this.dropdownButton.nativeElement.contains(clickedElement)) ||
      (clickedElement && this.menuButton && this.menuButton.nativeElement.contains(clickedElement)) ||
      (clickedElement && this.accountDropdownButton && this.accountDropdownButton.nativeElement.contains(clickedElement))
    ) {
      return;
    } else {
      this.showMenu = false;
      this.showDropdown = false;
    }
  }

  logout(): void {

    if (this.sessionService.isSessionActive()) {
      const sessionUser = this.sessionUser;

      if (sessionUser) {
        sessionUser.status = false;

        this.userService.update(sessionUser).pipe(
          concatMap((user: IUser) => {
            this.sessionService.logout();
            this.sessionService.emit({ type: 'logout' });
            this.showAccountDropdown = false;
            this.showDropdown = false;
            this.showMenu = false;
            return this.router.navigate(['/home']);
          }),
          catchError((error: HttpErrorResponse) => {
            return this.router.navigate(['/home']);
          })
        ).subscribe();
      } else {
        this.router.navigate(['/home']);
      }
    }
  }

  getUserInitials(): string {
    if (this.sessionUser.name && this.sessionUser.lastname) {
      return `${this.sessionUser.name.charAt(0)}${this.sessionUser.lastname.charAt(0)}`.toUpperCase();
    }
    return '';
  }

  // when click on the logo reload the page
  goToHome() {
    window.location.href = '/home';
  }

  resetBehavior(): void {
    document.scrollingElement?.scrollTo({ top: 0, behavior: 'auto' });
  }
}
