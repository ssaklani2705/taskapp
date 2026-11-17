// import { inject, PLATFORM_ID } from '@angular/core';
// import { isPlatformBrowser } from '@angular/common';
// import { CanActivateFn, Router } from '@angular/router';
// import { jwtDecode } from 'jwt-decode';

// export const authGuard: CanActivateFn = (route, state) => {
//   const router = inject(Router);
//   const platformId = inject(PLATFORM_ID);

//   // On the server there is no session; let the browser decide after hydration
//   if (!isPlatformBrowser(platformId)) return true;

//   const token = sessionStorage.getItem('authToken');
//   let valid = false;
//   if (token) {
//     try { valid = jwtDecode<{ exp: number }>(token).exp * 1000 > Date.now(); } catch { valid = false; }
//   }
//   if (valid) return true;

//   const loginPage = sessionStorage.getItem('loginType') === 'manager' ? '/manager-login' : '/login';
//   sessionStorage.clear();
//   return router.createUrlTree([loginPage], { queryParams: { returnUrl: state.url } });
// };

import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { TabSyncService } from '../../service/tab-sync.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  const tabSync = inject(TabSyncService);

  // On the server there is no session; let the browser decide after hydration
  if (!isPlatformBrowser(platformId)) return true;

  const hasValidToken = (): boolean => {
    const token = sessionStorage.getItem('authToken');
    if (!token) return false;
    try {
      return jwtDecode<{ exp: number }>(token).exp * 1000 > Date.now();
    } catch {
      return false;
    }
  };

  if (hasValidToken()) return true;

  // Read this before anything is cleared
  const loginPage = sessionStorage.getItem('loginType') === 'manager' ? '/manager-login' : '/login';

  // New tab (or stale token): drop the token and ask the other open tabs for a live session
  sessionStorage.removeItem('authToken');
  if ((await tabSync.restoreSession()) && hasValidToken()) return true;

  sessionStorage.clear();
  return router.createUrlTree([loginPage], { queryParams: { returnUrl: state.url } });
};