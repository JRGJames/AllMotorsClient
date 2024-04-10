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

  strUserName: string = "";
  sessionUser: IUser | null = null;
  strUrl: string = "";
  showDropdown: boolean = false;
  showMenu: boolean = false;

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
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const clickedElement = event.target as HTMLElement;

    if (clickedElement && this.dropdownButton && this.dropdownButton.nativeElement.contains(clickedElement)) {
      return;
    }

    if (clickedElement && this.dropdownContainer && this.dropdownContainer.nativeElement.contains(clickedElement)) {
      return;
    }

    this.showDropdown = false;
  }

  logout() {
    this.sessionService.logout();
    this.sessionService.emit({ type: 'logout' });
    this.router.navigate(['/home']);
  }

  // goToHome() {
  //   document.scrollingElement?.scrollTo({ top: 0, behavior: 'auto' });
  //   window.location.href = '/home';
  // }  

  // reloadComponent(self: boolean, urlToNavigateTo?: string) {
  //   //skipLocationChange:true means dont update the url to / when navigating
  //   console.log("Current route I am on:", this.router.url);
  //   const url = self ? this.router.url : urlToNavigateTo;
  //   this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
  //     this.router.navigate([`/${url}`]).then(() => {
  //       console.log(`After navigation I am on:${this.router.url}`)
  //     })
  //   })
  // }
}
