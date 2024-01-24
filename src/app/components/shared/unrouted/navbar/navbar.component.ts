import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { IUser, SessionEvent } from 'src/app/model/model';
import { SessionService } from 'src/app/service/session.service';
import { UserService } from 'src/app/service/user.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { UserUserDetailUnroutedComponent } from 'src/app/components/user/user/user-user-detail-unrouted/user-user-detail-unrouted.component';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  strUserName: string = "";
  sessionUser: IUser | null = null;
  strUrl: string = "";

  constructor(
    private sessionService: SessionService,
    public dialogService: DialogService,
    private userService: UserService,
    private router: Router,
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

  doSessionUserView($event: Event) {
    if (this.sessionUser) {
      let ref: DynamicDialogRef | undefined;
      ref = this.dialogService.open(UserUserDetailUnroutedComponent, {
        data: {
          id: this.sessionUser.id
        },
        header: 'User Detail',
        width: '50%',
        contentStyle: { overflow: 'auto' },
        baseZIndex: 10000,
        maximizable: false
      });
    }
    return false;
  }

  isUserLoggedIn(): boolean {
    return !!this.strUserName;
  }
}
