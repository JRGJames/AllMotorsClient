import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { SessionService } from "../service/session.service";
import { Observable } from "rxjs";


@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(
        private sessionService: SessionService
    ) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        
        if (this.sessionService.isSessionActive()) {
            const token = this.sessionService.getToken();
            if (token) {
                const cloned = req.clone({
                    headers: req.headers.set("Authorization", "Bearer " + token)
                });
                return next.handle(cloned);
            }
            else {
                return next.handle(req);
            }
        } else {
            return next.handle(req);
        }
        
    }
}
