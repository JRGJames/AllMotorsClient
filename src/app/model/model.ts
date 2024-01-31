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
    gender: string;
    birthdate: Date;
    country: string;
    province: string;
    address: string;
    postalCode: string;
    description: string;
    profilePicture: string;
    rating: number;
    status: Boolean;
    phone: string;
    email: string;
    password: string;
    role: Boolean;
    memberSince: Date;
    lastLogin: Date;
    banned: Boolean;
    actived: Boolean;
}

export interface IUserPage extends IPage<IUser> {
}

export interface ICar extends IEntity {
    brand: string;
    model: string;
    dateUpload: Date;
    images: IImage[];
    status: string;
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
    plate: string;
    type: string;
    location: string;
    emissions: number;
    description: string;
    consumption: number;
    currency: string;
    boughtIn: string;
    acceleration: number;
    drive: string;
    engine: string;
    dgtSticker: string;
    lastITV: Date;
    lastUpdate: Date;
    owner: IUser;
}

export interface ICarPage extends IPage<ICar> {
}

export interface IImage {
    imageUrl: string;
    car: ICar;
}

export interface IChat extends IEntity {
    creationDate: Date;
    notifications: number;
    memberOne: IUser;
    memberTwo: IUser;
    car: ICar;

}

export interface IChatPage extends IPage<IChat> {
}

export interface IMessage extends IEntity {
    content: string;
    sentTime: Date;
    sender: IUser;
    chat: IChat;
    receiver: IUser;
    isRead: Boolean;
    isLiked: Boolean;
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