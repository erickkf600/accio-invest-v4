import { inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  type HttpInterceptorFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { Subject, throwError } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;
let refreshSubject: Subject<void> | null = null;

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (req.url.includes('/auth/refresh')) {
    return next(req);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) {
        return throwError(() => error);
      }

      if (!isRefreshing) {
        isRefreshing = true;
        refreshSubject = new Subject<void>();

        return auth.refreshToken().pipe(
          switchMap(() => {
            isRefreshing = false;
            refreshSubject!.next();
            refreshSubject!.complete();
            refreshSubject = null;

            const newToken = auth.accessToken();
            const cloned = req.clone({
              headers: req.headers.set('Authorization', `Bearer ${newToken}`),
            });
            return next(cloned);
          }),
          catchError((refreshError) => {
            isRefreshing = false;
            refreshSubject!.error(refreshError);
            refreshSubject = null;
            auth.logout();
            router.navigate(['/login']);
            return throwError(() => refreshError);
          }),
        );
      }

      const subject = refreshSubject!;
      return subject.pipe(
        filter((v) => v !== undefined),
        take(1),
        switchMap(() => {
          const newToken = auth.accessToken();
          const cloned = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${newToken}`),
          });
          return next(cloned);
        }),
      );
    }),
  );
};
