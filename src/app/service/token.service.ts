import { Injectable } from '@angular/core';
import { LoginService, RefreshResponse } from './login.service';
import {jwtDecode} from 'jwt-decode';

@Injectable({ providedIn: 'root' })
export class TokenService {
  private refreshTimeout?: any;

  constructor(private loginService: LoginService) {}

  startTokenTimer(token: string) {
    const decoded: any = jwtDecode(token);
    const expiresAt = decoded.exp * 1000;
    const timeLeft = expiresAt - Date.now();
    const refreshBefore = 15000; // refresh 15 seconds before expiry

    const timeout = timeLeft - refreshBefore;
    if (timeout > 0) {
      // console.log(` Token will auto-refresh in ${Math.floor(timeout / 1000)}s`);
      this.refreshTimeout = setTimeout(() => this.refreshToken(), timeout);
    } else {
      // console.warn(' Token near expiry, refreshing now...');
      this.refreshToken();
    }
  }

  refreshToken() {
    const token = sessionStorage.getItem('authToken');
    if (!token) return;

    // console.log(' Calling refreshToken API...');
    this.loginService.freshToken().subscribe({
      next: (res: RefreshResponse) => {
        if (res.success && res.data?.token) {
          const newToken = res.data.token;
          sessionStorage.setItem('authToken', newToken);
          // console.log(' Token refreshed successfully');
          this.startTokenTimer(newToken);
        } else {
          // console.error(' Refresh API returned invalid response', res);
        }
      },
      // error: err => console.error(' Auto refresh failed:', err)
    });
  }

  clearTokenTimer() {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
      // console.log(' Token timer cleared');
    }
  }

  initTokenTimer() {
    const token = sessionStorage.getItem('authToken');
    if (token) this.startTokenTimer(token);
  }
}
