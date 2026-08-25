<<<<<<< HEAD
import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  return true;
=======
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const token = sessionStorage.getItem('authToken');

  if (token) {
    return true;
  }

  return router.createUrlTree(['/login']);
>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
};
