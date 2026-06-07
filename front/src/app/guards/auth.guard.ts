import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = sessionStorage.getItem('auth_token');

  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};
