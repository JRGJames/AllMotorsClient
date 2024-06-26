export interface Sort {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
}

export interface Pageable {
    sort: Sort;
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    unpaged: boolean;
}

export interface IPage<T> {
    content: T[];
    pageable: Pageable;
    totalPages: number;
    totalElements: number;
    last: boolean;
    size: number;
    number: number;
    sort: Sort;
    numberOfElements: number;
    first: boolean;
    empty: boolean;
}

export interface IEntity {
    id: number;
}

export interface IUser extends IEntity {
    name: string;
    lastname: string;
    username: string;
    gender: boolean;
    birthdate: Date;
    location: string;
    country: string;
    city: string;
    description: string;
    profilePicture: string;
    profileBackground: string;
    status: boolean;
    phone: string;
    email: string;
    password: string;
    role: boolean;
    memberSince: Date;
    lastConnection: Date;
    banned: boolean;
    actived: boolean;
    saves: ISaved[];
    ratingCount: number;
    ratingAverage: number;
}

export interface IUserPage extends IPage<IUser> {
}

export interface ISaved {
    user: IUser;
    car: ICar;
}

export interface IRating extends IEntity{
    ratedUserId: number; // ID del usuario que recibe la valoración
    ratingUserId: number; // ID del usuario que da la valoración
    score: number; // Puntuación otorgada
}

export interface RatingSummary {
    averageRating: number; // La media de las valoraciones
    ratingCount: number; // El total de valoraciones
}


export interface ICar extends IEntity {
    brand: string;
    model: string;
    title: string;
    dateUploaded: Date;
    images: IImage[];
    views: number;
    saves: number;
    color: string;
    year: number;
    seats: number;
    doors: number;
    horsepower: number;
    gearbox: string;
    distance: number;
    fuel: string;
    price: number;
    type: string;
    location: string;
    city: string;
    emissions: number;
    description: string;
    consumption: number;
    currency: string;
    acceleration: number;
    drive: string;
    lastUpdate: Date;
    owner: IUser;
}

export interface ICarPage extends IPage<ICar> {
}

export interface IModel {
    name: string;
    // Agrega otras propiedades relevantes para los modelos
}

export interface IBrand {
    name: string;
    models: IModel[];
}

export interface IImage extends IEntity{
    imageUrl: string;
    car: ICar;
}

export interface IChat extends IEntity {
    creationDate: Date;
    notifications: number;
    memberOne: IUser;
    memberTwo: IUser;
    car: ICar;
    messages: IMessage[];
}

export interface IChatPage extends IPage<IChat> {
}

export interface IMessage extends IEntity {
    content: string;
    sentTime: Date;
    sender: IUser;
    chat: IChat;
    receiver: IUser;
    read: Boolean;
    liked: boolean;
}

export interface IMessagePage extends IPage<IMessage> {
}

export type formOperation = 'EDIT' | 'NEW';

export interface SessionEvent {
    type: string;
}

export interface IToken {
    jti: string;
    iss: string;
    iat: number;
    exp: number;
    name: string;
}