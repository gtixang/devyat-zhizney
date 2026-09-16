import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';

/**
 * Guard для authenticated/admin-маршрутов. Подключён к `/admin` в app.routes.ts.
 * Неавторизованный посетитель отправляется на страницу логина.
 */
export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  await authService.waitUntilReady();

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.parseUrl('/login');
};
