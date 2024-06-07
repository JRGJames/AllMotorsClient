import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  hideFooter: boolean = false;

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Lista de rutas donde se desea ocultar el footer
        const routesToHideFooter = ['/login', '/signup', '/upload', '/chats'];
        this.hideFooter = routesToHideFooter.includes(event.url);
      }
    });
  }
}
