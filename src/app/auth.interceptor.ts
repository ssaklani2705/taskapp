import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2'; 
import { LoginService } from './service/login.service';
import { TokenService } from './service/token.service';

export interface RefreshResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    username?: string;
  } | null;
}

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;

  constructor(
    private router: Router,
    private loginService: LoginService,
    private tokenService: TokenService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.includes('/auth/login') || req.url.includes('/auth/captcha') ||  req.url.includes('/auth/forgotpasswordMail') ||  req.url.includes('/auth/forgotpassword')) {
      return next.handle(req);
    }

    const token = sessionStorage.getItem('authToken');
    if (!token) {
      this.showSessionTimeout();
      return throwError(() => new Error('No token found'));
    }

    // Check if token is expiring soon
    if (this.isTokenExpiringSoon(token) && !this.isRefreshing) {
      // console.log(' Token expiring soon — refreshing...');
      this.isRefreshing = true;

      this.loginService.freshToken().subscribe({
        next: (res: RefreshResponse) => {
          this.isRefreshing = false;
          if (res.success && res.data?.token) {
            // console.log('Token refreshed successfully');
            sessionStorage.setItem('authToken', res.data.token);
            this.tokenService.startTokenTimer(res.data.token);
          } else {
            this.showSessionTimeout();
          }
        },
        error: (err) => {
          this.isRefreshing = false;
          console.error('Token refresh failed:', err);
          this.showSessionTimeout();
        }
      });
    }

    const authReq = this.addTokenHeader(req, token);
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.warn('401 Unauthorized — Session expired');
          this.showSessionTimeout();
        }
        return throwError(() => error);
      })
    );
  }

  private addTokenHeader(req: HttpRequest<any>, token: string): HttpRequest<any> {
    return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  private isTokenExpiringSoon(token: string): boolean {
    try {
      const decoded: any = jwtDecode(token);
      const expiresAt = decoded.exp * 1000;
      const timeLeft = expiresAt - Date.now();
      // console.log(` Token time left: ${Math.floor(timeLeft / 1000)}s`);
      if (timeLeft <= 0) {
        //  Token already expired
        this.showSessionTimeout();
        return true;
      }
      // return timeLeft < 600000; // less than 10 minutes 
      return timeLeft < 3600000; // less than 1 hour 
    } catch (err) {
      console.error('Failed to decode token:', err);
      this.showSessionTimeout();
      return true;
    }
  }

  private showSessionTimeout() {
    Swal.fire({
      title: 'Session Expired',
      text: 'Your session has timed out. Please log in again.',
      icon: 'warning',
      confirmButtonText: 'OK',
      allowOutsideClick: false,
      allowEscapeKey: false,
      heightAuto: false
    }).then(() => {
      this.forceLogout();
    });
  }

  private forceLogout() {
    console.warn('Logging out user...');
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}


