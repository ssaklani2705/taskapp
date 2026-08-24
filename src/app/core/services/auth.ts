import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  LoginRequest,
  LoginResponse
} from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

    private readonly http = inject(HttpClient);

  private readonly apiUrl = environment.apiBaseUrl;

  getCaptcha(): Observable<{ success: boolean; message: string; data: string }> {
    return this.http.get<{ success: boolean; message: string; data: string }>(
      `${environment.apiBaseUrl}auth/captcha`,
          { withCredentials: true }   // MUST ADD THIS

    );
  }

  login(request: LoginRequest): Observable<LoginResponse> {

    return this.http.post<LoginResponse>(
      `${this.apiUrl}auth/login`,
      request
    ).pipe(

      tap(response => {

        if (response.success && response.data) {

          localStorage.setItem(
            'accessToken',
            response.data.token
          );

          localStorage.setItem(
            'refreshToken',
            response.data.refreshToken
          );

          localStorage.setItem(
            'userId',
            response.data.userId.toString()
          );

          localStorage.setItem(
            'username',
            response.data.username
          );

          localStorage.setItem(
            'email',
            response.data.email
          );

          localStorage.setItem(
            'role',
            response.data.role
          );
        }
      })
    );
  }

  logout(): void {

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getUserId(): number | null {

    const id = localStorage.getItem('userId');

    return id ? Number(id) : null;
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }
}