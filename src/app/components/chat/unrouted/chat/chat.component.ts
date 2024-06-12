import { Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, SimpleChanges, ViewChild } from '@angular/core';
import { IChat, IUser, IMessage } from 'src/app/model/model';
import { Router } from '@angular/router';
import { SessionService } from 'src/app/service/session.service';
import { UserService } from 'src/app/service/user.service';
import { HttpErrorResponse } from '@angular/common/http';
import { API_URL_MEDIA } from 'src/environment/environment';
import { MessageService } from 'src/app/service/message.service';
import { ChatService } from 'src/app/service/chat.service';
import { WebSocketService } from 'src/app/service/webSocket.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  @Input() chat!: IChat;
  @Output() chatUpdated = new EventEmitter<IChat>(); // Nuevo EventEmitter
  @Output() moveToChatListEvent = new EventEmitter<void>();

  backgroundImage: string = `url(assets/images/image4.webp)`;
  receiver: IUser = {} as IUser;
  sender: IUser = {} as IUser;
  currentUser: IUser = {} as IUser;
  urlImage: string = API_URL_MEDIA;
  selectedBackgroundImage: string = '';
  message: IMessage = {} as IMessage;
  messages: IMessage[] = [];
  maxWidth: number = 30;
  messageContent: string = '';
  imageIndex: number = 0;

  @ViewChild('messageContainer') messageContainer!: ElementRef;

  constructor(
    private userService: UserService,
    private router: Router,
    private sessionService: SessionService,
    private messageService: MessageService,
    private chatService: ChatService,
    private webSocketService: WebSocketService,
    private elementRef: ElementRef,
  ) { }

  ngOnInit(): void {
    this.getCurrentUser(); // Aquí debes obtener el chatId correspondiente
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['chat'] && this.chat) {
      this.checkIfUserIsMember(this.chat);
      this.setBackground(this.chat);
      if (this.chat.id) {
        this.scrollToBottom();
        this.fillMessages();
        const container = document.getElementById('UserChatContainer');

        if (container) {
          container.style.transform = 'translateX(0)';
        }

        this.webSocketService.connect(this.chat.id).subscribe(
          (message: IMessage) => {
            // Agregar el chatId al mensaje (si es necesario)
            message.chat = this.chat;
            this.messages.push(message);
            // Desplazarse hacia abajo para mostrar el mensaje más reciente
            this.scrollToBottom();
          },
          (error) => {
            console.error(error);
          }
        );
      }
      document.getElementById('message')?.focus();
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
      this.router.navigate(['/login']);
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
    let messageContent = (document.getElementById('message') as HTMLInputElement).value.trim();
    if (messageContent === '') {
      return;
    }

    this.message.content = messageContent;
    this.message.sender = this.sender;
    this.message.receiver = this.receiver;
    this.message.chat = this.chat;
    this.message.sentTime = new Date();

    this.messageService.send(this.message, this.chat.car?.id).subscribe({
      next: (message: IMessage) => {
        this.scrollToBottomSend();
        this.chatUpdated.emit(this.chat); // Emite el chat actualizado
        this.message = {} as IMessage;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error al enviar el mensaje:', error);
      }
    });

    (document.getElementById('message') as HTMLInputElement).value = '';
  }

  scrollToBottom() {
    setTimeout(() => {
      if (this.messageContainer) {
        const container = this.messageContainer.nativeElement;
        container.scrollTop = container.scrollHeight;
      }
    }, 75); // Adjust timeout value as needed
  }

  scrollToBottomSend() {
    setTimeout(() => {
      if (this.messageContainer) {
        const container = this.messageContainer.nativeElement;
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      }
    }, 5); // Adjust timeout value as needed
  }


  likeMessage(message: IMessage): void {
    const liked = !message.liked;
    this.messageService.like(message.id, liked).subscribe(
      () => {
        message.liked = liked;
      },
      error => {
        console.error('Error liking message', error);
      }
    );
  }

  // mark as read every unread message from the receiver
  markMessagesAsRead(): void {
    this.messages.forEach((message: IMessage) => {
      if (message.receiver.id === this.currentUser.id && !message.read) {
        this.messageService.read(message.id).subscribe({
          next: () => {
            message.read = true;
          },
          error: (error: HttpErrorResponse) => {
            console.error('Error al marcar el mensaje como leído:', error);
          }
        });
      }
    });
  }

  // Verifica si el último mensaje enviado por el remitente está leído por el receptor

  fillMessages(): void {
    try {
      this.chatService.getMessages(this.chat.id).subscribe({
        next: (messages: IMessage[]) => {
          this.messages = messages;
          this.markMessagesAsRead();
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error al cargar los mensajes:', error);
        }
      });
    } catch (error) {
      console.log('Chat sin valor, no se pueden cargar los mensajes');
    }
  }


  handleKey(event: KeyboardEvent): void {
    // Si la tecla presionada es Enter y Shift también está presionado
    if (event.key === 'Enter' && event.shiftKey) {
      // Agrega un salto de línea al contenido del mensaje
      this.messageContent += '\n';
      // Previene el comportamiento predeterminado (salto de línea)
      event.preventDefault();
    } else if (event.key === 'Enter') {
      // Si solo se presionó Enter, envía el mensaje
      this.sendMessage();
      // Previene el comportamiento predeterminado (salto de línea)
      event.preventDefault();
    }
  }

  shouldShowDate(index: number): boolean {
    if (index === 0) return true;
    const currentMessageDate = new Date(this.messages[index].sentTime).toDateString();
    const previousMessageDate = new Date(this.messages[index - 1].sentTime).toDateString();
    return currentMessageDate !== previousMessageDate;
  }

  prevImage() {
    this.imageIndex--;
  }

  nextImage() {
    this.imageIndex++;
  }

  changePage(newPage: number) {
    this.imageIndex = newPage;
  }

  moveToChatList() {
    this.moveToChatListEvent.emit();
    const container = document.getElementById('chatContainer');

    if (container) {
      container.style.transform = 'translateX(0%)';
    }
  }

  moveToOptions() {
    const container = document.getElementById('UserChatContainer');

    if (container) {
      container.style.transform = 'translateX(-50%)';
    }
  }

  moveToChat() {
    const container = document.getElementById('UserChatContainer');

    if (container) {
      container.style.transform = 'translateX(0%)';
    }
  }
}
