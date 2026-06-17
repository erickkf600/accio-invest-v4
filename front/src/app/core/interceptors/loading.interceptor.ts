import { inject } from '@angular/core';
import type { HttpInterceptorFn } from '@angular/common/http';
import { finalize } from 'rxjs';
import { HAS_LOADING } from '../constants/http-context';
import { LoadingService } from '../services/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.context.get(HAS_LOADING)) {
    return next(req);
  }

  const loadingService = inject(LoadingService);
  loadingService.show();

  return next(req).pipe(finalize(() => loadingService.hide()));
};
