  import { HttpErrorResponse } from '@angular/common/http';
  import { Component, OnInit } from '@angular/core';
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

    strUserName: string = "";
    sessionUser: IUser | null = null;
    strUrl: string = "";
    showDropdown: boolean = false;

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

    toggleDropdown() {
      this.showDropdown = !this.showDropdown;
    }

    logout() {
      this.sessionService.logout();
      this.sessionService.emit({ type: 'logout' });
      this.router.navigate(['/home']);
    }
  }
