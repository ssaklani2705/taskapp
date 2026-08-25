import { HttpInterceptorFn } from '@angular/common/http';
<<<<<<< HEAD

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req);
=======
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const router = inject(Router);
  const token = sessionStorage.getItem('authToken');

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError(error => {

      if (error.status === 401) {

        // Token expired / invalid
        sessionStorage.removeItem('authToken');

        router.navigate(['/login'], {
          replaceUrl: true
        });
      }

      return throwError(() => error);
    })
  );

>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
};
