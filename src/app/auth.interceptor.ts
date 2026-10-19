import { Injectable } from '@angular/core';
import {
  HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { LoginService } from './service/login.service';
import { TokenService } from './service/token.service';
import { environment } from '../environments/environment';

export interface RefreshResponse {
  success: boolean;
  message: string;
  data?: { token: string; username?: string } | null;
}

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private sessionExpiredShown = false;

  private readonly publicUrls = [
    '/auth/login', '/auth/captcha', '/auth/forgotpasswordMail', '/auth/forgotpassword'
  ];

  constructor(
    private router: Router,
    private loginService: LoginService,
    private tokenService: TokenService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // 1. Not our API (assets, third-party): leave alone
    if (!req.url.startsWith(environment.apiBaseUrl)) {
      return next.handle(req);
    }

    // 2. Public endpoints: no token needed
    if (this.publicUrls.some(u => req.url.includes(u))) {
      return next.handle(req);
    }

    const token = sessionStorage.getItem('authToken');

    // 3. Logout: send it, but never show the popup
    if (req.url.includes('/auth/logout')) {
      return next.handle(token ? this.addTokenHeader(req, token) : req);
    }

    if (!token) {
      this.showSessionTimeout();
      return throwError(() => new Error('No token found'));
    }

    const msLeft = this.msUntilExpiry(token);
    if (msLeft <= 0) {
      this.showSessionTimeout();
      return throwError(() => new Error('Token expired'));
    }

    if (msLeft < 3600000 && !this.isRefreshing && !req.url.includes('/auth/refreshtoken')) {
      this.refreshToken();
    }

    return next.handle(this.addTokenHeader(req, token)).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.showSessionTimeout();
        }
        // 403 = logged in but not allowed: do NOT log out, let the page show a message
        return throwError(() => error);
      })
    );
  }

  private refreshToken(): void {
    this.isRefreshing = true;
    this.loginService.freshToken().subscribe({
      next: (res: RefreshResponse) => {
        this.isRefreshing = false;
        if (res.success && res.data?.token) {
          sessionStorage.setItem('authToken', res.data.token);
          this.tokenService.startTokenTimer(res.data.token);
        } else {
          this.showSessionTimeout();   // server refused: user deactivated or token invalid
        }
      },
      error: () => {
        // A 401 is already handled in intercept(); other errors (network) leave
        // the current token alone, since it is still valid.
        this.isRefreshing = false;
      }
    });
  }

  private addTokenHeader(req: HttpRequest<any>, token: string): HttpRequest<any> {
    return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  private msUntilExpiry(token: string): number {
    try {
      return jwtDecode<{ exp: number }>(token).exp * 1000 - Date.now();
    } catch {
      return 0;   // unreadable token counts as expired
    }
  }

  private showSessionTimeout(): void {
    if (this.sessionExpiredShown) return;   // only one popup at a time
    this.sessionExpiredShown = true;

    Swal.fire({
      title: 'Session Expired',
      text: 'Your session has timed out. Please log in again.',
      icon: 'warning',
      confirmButtonText: 'OK',
      allowOutsideClick: false,
      allowEscapeKey: false,
      heightAuto: false
    }).then(() => this.forceLogout());
  }

  private forceLogout(): void {
    const loginPage = sessionStorage.getItem('loginType') === 'manager' ? '/manager-login' : '/login';
    sessionStorage.clear();
    this.sessionExpiredShown = false;
    this.isRefreshing = false;
    this.router.navigate([loginPage], { replaceUrl: true });
  }
}