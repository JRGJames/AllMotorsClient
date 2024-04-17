import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { IUser, SessionEvent } from 'src/app/model/model';
import { SessionService } from 'src/app/service/session.service';
import { UserService } from 'src/app/service/user.service';

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
  sessionUser: IUser | null = null;
  strUrl: string = "";
  showDropdown: boolean = false;
  showMenu: boolean = false;
  showAccountDropdown: boolean = false;

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

  logout() {
    this.sessionService.logout();
    this.sessionService.emit({ type: 'logout' });
    this.router.navigate(['/home']);
    this.showAccountDropdown = false;
    this.showDropdown = false;
    this.showMenu = false;
  }

  // when click on the logo reload the page
  goToHome() {
    window.location.href = '/home';
  }
}
