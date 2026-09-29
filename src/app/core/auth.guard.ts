import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService); const router = inject(Router);
  return auth.logged() ? true : router.createUrlTree(['/login']);
};

export const adminGuard: CanActivateFn = async () => {
  const auth = inject(AuthService); const router = inject(Router);
  const u = auth.user() || await auth.loadMe();
  return u?.admin ? true : router.createUrlTree(['/']);
};
