import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  backgroundImage: string = `url(assets/images/image4.webp)`;

  constructor() { }

  ngOnInit() {
  }

}
