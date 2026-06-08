import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { type HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isRefreshing) {
        isRefreshing = true;
        return auth.refreshToken().pipe(
          switchMap(() => {
            isRefreshing = false;
            const newToken = auth.accessToken();
            const cloned = req.clone({
              headers: req.headers.set('Authorization', `Bearer ${newToken}`),
            });
            return next(cloned);
          }),
          catchError(() => {
            isRefreshing = false;
            auth.logout();
            router.navigate(['/login']);
            return throwError(() => error);
          })
        );
      }

      if (error.status === 401) {
        auth.logout();
        router.navigate(['/login']);
      }

      return throwError(() => error);
    })
  );
};
