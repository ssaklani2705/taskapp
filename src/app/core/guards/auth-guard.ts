import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // On the server there is no session; let the browser decide after hydration
  if (!isPlatformBrowser(platformId)) return true;

  const token = sessionStorage.getItem('authToken');
  let valid = false;
  if (token) {
    try { valid = jwtDecode<{ exp: number }>(token).exp * 1000 > Date.now(); } catch { valid = false; }
  }
  if (valid) return true;

  const loginPage = sessionStorage.getItem('loginType') === 'manager' ? '/manager-login' : '/login';
  sessionStorage.clear();
  return router.createUrlTree([loginPage], { queryParams: { returnUrl: state.url } });
};