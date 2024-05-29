import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { IChat, IUser, ICar, IMessage } from 'src/app/model/model';
import { Router } from '@angular/router';
import { SessionService } from 'src/app/service/session.service';
import { UserService } from 'src/app/service/user.service';
import { HttpErrorResponse } from '@angular/common/http';
import { API_URL_MEDIA } from 'src/environment/environment';
import { MessageService } from 'src/app/service/message.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  @Input() chat!: IChat;
  backgroundImage: string = `url(assets/images/image4.webp)`;
  receiver: IUser = {} as IUser;
  sender: IUser = {} as IUser;
  currentUser: IUser = {} as IUser;
  urlImage: string = API_URL_MEDIA;
  selectedBackgroundImage: string = '';
  message: IMessage = {} as IMessage;

  constructor(
    private userService: UserService,
    private router: Router,
    private sessionService: SessionService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.getCurrentUser();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['chat'] && this.chat) {
      this.checkIfUserIsMember(this.chat);
      this.setBackground(this.chat);
    }
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
    } else {
      this.router.navigate(['/login']); // Redirige al login si no hay sesión activa
    }
  }

  getUserInitials(user: IUser): string {
    if (user.name && user.lastname) {
      return `${user.name.charAt(0)}${user.lastname.charAt(0)}`.toUpperCase();
    }
    return '';
  }

  checkIfUserIsMember(chat: IChat): void {
    try {
      if (chat.memberOne.id === this.currentUser.id) {
        this.receiver = chat.memberTwo;
        this.sender = chat.memberOne;
      } else {
        this.receiver = chat.memberOne;
        this.sender = chat.memberTwo;
      }
    } catch (error) {
      console.log('Chat sin valor, no se puede comparar los miembros del chat');
      this.chat = {} as IChat;
    }
  }


  setBackground(chat: IChat): void {
    try {
      if (chat.car === null) {
        this.selectedBackgroundImage = this.backgroundImage;
      } else {
        this.selectedBackgroundImage = `url('${this.urlImage + chat.car.images[0].imageUrl}')`;
      }
    } catch (error) {
      console.log('Chat sin valor, no se puede cargar la imagen de fondo');
    }
  }

  sendMessage(): void {
    const messageContent = (document.getElementById('message') as HTMLInputElement).value;
    if (messageContent === '') {
      return;
    } else {
      console.log('Mensaje enviado:', messageContent);

      this.message.content = messageContent;
      this.message.sender = this.sender;
      this.message.receiver = this.receiver;
      this.message.chat = this.chat;
      this.message.sentTime = new Date();

      // Enviar mensaje
      console.log('Enviando mensaje:', this.message, this.chat.car?.id);
      this.messageService.send(this.message, this.chat.car?.id).subscribe({
        next: (message: IMessage) => {
          console.log('Mensaje enviado:', message);
          // this.message = {} as IMessage;
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error al enviar el mensaje:', error);
        }
      });

      (document.getElementById('message') as HTMLInputElement).value = '';
    }
  }
}