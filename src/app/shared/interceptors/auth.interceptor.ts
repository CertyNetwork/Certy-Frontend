import {
  HttpInterceptor,
  HttpHandler,
  HttpEvent,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class TokenHttpInterceptor implements HttpInterceptor {
  
  constructor(
    private authService: AuthService
  ) {
    //
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    if (req.headers.get('no-token')) {
      return next.handle(req);
    }
    const token = this.authService.getAccessToken();
    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `${token}`
        },
        url: req.url,
      });
    } else {
      req = req.clone({
        url: req.url,
      });
    }
    return next.handle(req).pipe(
      map(res => {
        return res;
      }),
      catchError(err => {
        if (err instanceof HttpErrorResponse) {
          switch (err.status) {
            case 403:
            case 401:
              const { error } = err;
              if (error.error === 'Unauthorized') {
                return this.handleAccessTokenExpire(req, next);
              }
              break;
            default:
              break;
          }
        }
        return throwError(() => err);
      })
    );
  }

  handleAccessTokenExpire(request: HttpRequest<any>, next: HttpHandler) {
    const refreshToken = this.authService.getRefreshToken();
    if (refreshToken) {
      return this.authService.refreshAccessToken(refreshToken).pipe(
        switchMap((accessToken: any) => {
          return next.handle(this.addTokenHeader(request, accessToken));
        }),
        catchError((err) => {
          this.authService.logout();
          return throwError(() => err);
        })
      );
    } else {
      return throwError(() => null);
    }
  }

  private addTokenHeader(request: HttpRequest<any>, token: string) {
    const req = request.clone({
      setHeaders: {
        Authorization: `${token}`
      },
      url: request.url,
    });
    return req;
  }
}
