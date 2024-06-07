// chat-list.component.ts
import { Component, OnInit } from '@angular/core';
import { IChat, IUser } from 'src/app/model/model';
import { ChatService } from 'src/app/service/chat.service';
import { SessionService } from 'src/app/service/session.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/app/service/user.service';
import { API_URL_MEDIA } from 'src/environment/environment';
import { MessageService } from 'src/app/service/message.service';

@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.css']
})
export class ChatListComponent implements OnInit {
  backgroundImage: string = `url(assets/images/image4.webp)`;
  selectedBackgroundImage: string = '';
  chats: IChat[] = [];
  currentUser: IUser = {} as IUser;
  urlImage = API_URL_MEDIA;
  selectedChat: IChat = {} as IChat;
  receiver: IUser = {} as IUser;
  seller: IUser = {} as IUser;
  chatsNotifications: { [key: number]: number } = {};

  constructor(
    private chatService: ChatService,
    private sessionService: SessionService,
    private router: Router,
    private userService: UserService,
    private route: ActivatedRoute,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.getCurrentUser();
    this.subscribeToChatUpdates();
    this.selectedBackgroundImage = this.backgroundImage;

    // Subscribe to route parameters
    this.route.params.subscribe(params => {
      const chat = params['chat'];
      if (chat) {
        // Parse chat data if necessary
        try {
          const chatData = JSON.parse(decodeURIComponent(chat));
          this.selectedChat = chatData;
          this.checkIfUserIsMember(this.selectedChat);
          this.setBackground(this.selectedChat);
        } catch (error) {
          console.error('Error parsing chat data:', error);
        }
      }
    });
  }

  getCurrentUser(): void {
    if (this.sessionService.isSessionActive()) {
      const username = this.sessionService.getUsername();
      this.userService.getByUsername(username).subscribe({
        next: (user: IUser) => {
          this.currentUser = user;
          this.getChats(user.id);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error al cargar los datos del usuario actual:', error);
        }
      });
    } else {
      this.router.navigate(['/login']); // Redirige al login si no hay sesión activa
    }
  }

  getChats(userId: number): void {
    this.chatService.getAll(userId).subscribe({
      next: (data: IChat[]) => {
        this.chats = data;
        this.chats.forEach(chat => {
          this.getNotifications(chat);
        });
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error al cargar los chats:', error);
      }
    });
  }

  getNotifications(chat: IChat): void {
    this.chatService.getMessagesNotRead(chat.id, this.currentUser).subscribe({
      next: (data: number) => {
        this.chatsNotifications[chat.id] = data;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error al cargar los mensajes no leídos:', error);
      }
    });
  }

  subscribeToChatUpdates(): void {
    this.messageService.messageSent.subscribe(() => {
      this.getChats(this.currentUser.id); // Actualizar la lista de chats después de enviar un mensaje
    });
  }

  onChatUpdated(): void {
    this.getChats(this.currentUser.id); // Actualizar la lista de chats después de enviar un mensaje
  }

  getUserInitials(user: IUser): string {
    if (user.name && user.lastname) {
      return `${user.name.charAt(0)}${user.lastname.charAt(0)}`.toUpperCase();
    }
    return '';
  }

  checkIfUserIsMember(chat: IChat): void {
    if (chat.memberOne.id === this.currentUser.id) {
      this.receiver = chat.memberTwo;
    } else if (chat.memberTwo.id === this.currentUser.id) {
      this.receiver = chat.memberOne;
    }
  }

  setChat(chat: IChat): void {
    this.selectedChat = chat;
  }

  setBackground(chat: IChat): void {
    const container = document.getElementById('chatContainer');

    if (chat.car === null) {
      this.selectedBackgroundImage = this.backgroundImage;
    } else {
      this.selectedBackgroundImage = `url('${this.urlImage + chat.car.images[0].imageUrl}')`;
    }

    if (window.innerWidth < 640) {
      if (container) {
        container.style.transform = 'translateX(-50%)';
      }
    }
  }
}
